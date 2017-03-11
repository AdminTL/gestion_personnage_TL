#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import tornado
import tornado.web
import sys
import base_handler
import jsonhandler

io_loop = tornado.ioloop.IOLoop.instance()
config_path = "config"

ENABLE_FACEBOOK_FEED = False


def ioloop_wrapper(callback):
    # use this for async call
    def func(*args, **kwargs):
        io_loop.add_callback(callback, *args, **kwargs)

    return func


class IndexHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        self.render('news.html', enable_facebook_feed=ENABLE_FACEBOOK_FEED, **self._global_arg)


class ManualPageHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        self.render('manual.html', **self._global_arg)


class LoginHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        if self.get_secure_cookie("user"):
            self.redirect("/")
            
        invalid_login = self.get_argument("invalid", default=None)
        if self._global_arg["disable_login"]:
            invalid_login = "disable_login"
            
        self.render('login.html', invalid_login=invalid_login, **self._global_arg)

    @tornado.web.asynchronous
    def post(self):
        if self._global_arg["disable_login"]:
            self.redirect("/login?invalid=disable_login")

        if self.get_secure_cookie("user"):
            print("Need to logout before login or sign up.", file=sys.stderr)
            return

        email = self.get_argument("email")
        if not email:
            print("Email is empty.", file=sys.stderr)
            self.redirect("/login?invalid=email")

        password = self.get_argument("password")
        if not password:
            print("Password is empty.", file=sys.stderr)
            self.redirect("/login?invalid=password")

        #Login
        if self.get_arguments("name") == []:
            user = self._db.get_user(email, password)

            #If user is found, give him a secure cookie based on his user id
            if user:
                user_id = user.get("user_id")
                if user_id:
                    self.set_secure_cookie("user", user_id, httpOnly=True, expires_days=3)
                    self.redirect("/")
                else:
                    print("User doesn't have an id.", file=sys.stderr)
            else:
                print("Invalid email/password combination", file=sys.stderr)
                self.redirect("/login?invalid=login")

        #Sign Up
        else:
            name = self.get_argument("name")
            if not name:
                print("User name is empty.", file=sys.stderr)
                self.redirect("/login?invalid=name")

            if self._db.create_user(name, email, password):
                self.redirect("/login")
            else:
                self.redirect("/login?invalid=signup")


class LogoutHandler(base_handler.BaseHandler):
    def get(self):
        if self._global_arg["disable_login"]:
            return
        if self.current_user:
            self.clear_cookie("user")
            self.redirect("/")
        else:
            self.redirect("/login")


class AdminHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    @tornado.web.authenticated
    def get(self):
        if self._global_arg["disable_admin"]:
            return
        if self.current_user.get("permission") == "Admin":
            self.render('admin_character.html', **self._global_arg)
        else:
            print("Insufficient persmissions", file=sys.stderr)
            self.redirect("/") #TODO : HTTP error 403: Forbidden
        

class CharacterHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        if self._global_arg["disable_character"]:
            return
        self.render('character.html', **self._global_arg)


class CharacterViewHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    def get(self):
        if self._global_arg["disable_character"]:
            return

        user_id = self.request.query[len("user_id="):]
        is_admin = self.request.query == "is_admin"
        if user_id == "" and not is_admin:
            # leave now, missing permission
            self.finish()
            return

        # TODO manage what we get and user management permission
        if is_admin:
            data = json.dumps(self._db.get_all_user())
        else:
            data = json.dumps(self._db.get_all_user(user_id=user_id))

        self.write(data)
        self.finish()

    @tornado.web.asynchronous
    def post(self):
        if self._global_arg["disable_character"]:
            return
        self.prepare_json()

        # user_id = self.get_argument("user_id")
        user = self.get_argument("user")
        character = self.get_argument("character")
        delete_user_by_id = self.get_argument("delete_user_by_id")
        delete_character_by_id = self.get_argument("delete_character_by_id")

        # exception, if delete_user_by_id, create user if not exist
        if not user and delete_user_by_id:
            user = {"user_id": delete_user_by_id}

        self._db.update_user(user, character, delete_user_by_id=delete_user_by_id,
                               delete_character_by_id=delete_character_by_id)


class RulesHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    def get(self):
        self.write(self._rule.get_rule())
        self.finish()
        

class ValidateAuthHandler(base_handler.BaseHandler):
    """This class is designed purely for client-side validation"""
    @tornado.web.asynchronous
    def get(self):
        name = self.get_argument("name", default=None)
        email = self.get_argument("email", default=None)
        
        if name:
            self.write("0" if self._db.user_exists(name=name) else "1")
        elif email:
            self.write("0" if self._db.user_exists(email=email) else "1")

        # Produce a missing argument error
        else:
            self.get_argument("name or email")
        self.finish()
