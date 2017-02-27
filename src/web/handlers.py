#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import tornado
import tornado.web
import hashlib
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
        if self._global_arg["disable_login"]:
            return
        self.render('login.html', **self._global_arg)

    @tornado.web.asynchronous
    def post(self):
        if self._global_arg["disable_login"]:
            return

        if self.get_secure_cookie("user"):
            print("Need to logout before login or sign up.", file=sys.stderr)
            return
        
        email = self.get_argument("email")
        if not email:
            print("Email is empty.", file=sys.stderr)
            return
        
        password = self.get_argument("password")
        if not password:
            print("Password is empty.", file=sys.stderr)
            #return <-- Uncomment after we implement safe password storage.

        secure_pass = hashlib.sha256(password.encode('UTF-8')).hexdigest()
        
        #Login
        if self.get_arguments("name") == []:
            secure_pass = None # Temporary to let user login without password
            user = self._db.get_user(email, secure_pass)

            #If user is found, give him a secure cookie based on his uuid
            if user:
                uuid = user.get("id")
                if uuid:
                    self.set_secure_cookie("user", uuid, httpOnly=True, expires_days=3)
                    self.redirect("/")
                else:
                    print("User doesn't have an uuid.", file=sys.stderr)
            else:
                print("Invalid email/password combination", file=sys.stderr)
                self.redirect("/login")
                
        #Sign Up
        else:
            name = self.get_argument("name")
            if not name:
                print("User name is empty.", file=sys.stderr)
                return
            
            #TODO register
            print("Debug: entering sign up code")


class LogoutHandler(base_handler.BaseHandler):
    def get(self):
        if self._global_arg["disable_login"]:
            return
        self.clear_cookie("user")
        self.redirect("/")


class AdminHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        if self._global_arg["disable_admin"]:
            return
        self.render('admin_character.html', **self._global_arg)


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

        player_id = self.request.query[len("player_id="):]
        is_admin = self.request.query == "is_admin"
        if player_id == "" and not is_admin:
            # leave now, missing permission
            self.finish()
            return

        # TODO manage what we get and user management permission
        if is_admin:
            data = json.dumps(self._db.get_all_user())
        else:
            data = json.dumps(self._db.get_all_user(id=player_id))

        self.write(data)
        self.finish()

    @tornado.web.asynchronous
    def post(self):
        if self._global_arg["disable_character"]:
            return
        self.prepare_json()

        # user_id = self.get_argument("user_id")
        player = self.get_argument("player")
        character = self.get_argument("character")
        delete_player_id = self.get_argument("delete_player_id")
        delete_character_id = self.get_argument("delete_character_id")

        # exception, if delete_player_id, create player if not exist
        if not player and delete_player_id:
            player = {"id": delete_player_id}

        self._db.update_player(player, character, delete_player_id=delete_player_id,
                               delete_character_id=delete_character_id)


class RulesHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    def get(self):
        self.write(self._rule.get_rule())
        self.finish()
