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


class LorePageHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        self.render('lore.html', **self._global_arg)


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

        # EXTREMELY IMPORTANT to prevent accessing accounts that do not yet have a password.
        password = self.get_argument("password")
        if not password:
            print("Password is empty.", file=sys.stderr)
            self.redirect("/login?invalid=password")

        # Login
        if self.get_arguments("username") == []:

            username_or_email = self.get_argument("username_or_email")
            if not username_or_email:
                print("Email or Username is empty.", file=sys.stderr)
                self.redirect("/login?invalid=username_or_email")

            # Try finding the user by mail...
            user = None
            if "@" in username_or_email:
                print("in mail")
                user = self._db.get_user(email=username_or_email, password=password)
            # ... or by name.
            if not user:
                print("not in mail")
                user = self._db.get_user(name=username_or_email, password=password)

            # If user is found, give him a secure cookie based on his user id
            if user:
                self.give_cookie(user.get("user_id"))
            else:
                print("Invalid email/password combination", file=sys.stderr)
                self.redirect("/login?invalid=login")

        # Sign Up
        else:
            name = self.get_argument("username")
            if not name:
                print("Username is empty.", file=sys.stderr)
                self.redirect("/login?invalid=username")

            email = self.get_argument("email", default=None)

            password_mail = self.get_argument("pwconfirm")
            if not password_mail:
                print("Password is empty.", file=sys.stderr)
                self.redirect("/login?invalid=password")

            if self._db.create_user(name, email, password, password_mail):
                self.redirect("/login")
            else:
                self.redirect("/login?invalid=signup")


        else:
            user = self._db.get_user(email, secure_pass)

        if user:
            uuid = user.get("uuid")
            if uuid:
                self.set_secure_cookie("user", uuid)
        self.redirect("/")


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
            self.redirect("/")  # TODO : HTTP error 403: Forbidden


class ProfileHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    @tornado.web.authenticated
    def get(self, user_id=None):
        if self._global_arg["disable_character"]:
            return
        if user_id:
            user = self._db.get_user(user_id=user_id)
        else:
            user = self.current_user
        self.render('profile.html', user=user, **self._global_arg)


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


class ManualHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    def get(self):
        self.write(self._manual.get_str_all())
        self.finish()


class LoreHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    def get(self):
        self.write(self._lore.get_str_all())
        self.finish()


class StatSeasonPass(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    def get(self):
        self.write(self._db.stat_get_total_season_pass())
        self.finish()


class ValidateAuthHandler(base_handler.BaseHandler):
    """This class is designed purely for client-side validation"""

    @tornado.web.asynchronous
    def get(self):
        name = self.get_argument("username", default=None)
        email = self.get_argument("email", default=None)

        if name:
            self.write("0" if (self._db.user_exists(name=name) or self._db.user_exists(email=name)) else "1")
        elif email:
            self.write("0" if (self._db.user_exists(email=email) or self._db.user_exists(name=email)) else "1")

        # Produce a missing argument error
        else:
            self.get_argument("username or email")
        self.finish()
