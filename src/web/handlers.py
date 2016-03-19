#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import tornado
import tornado.web
import hashlib
import sys
import userapp
import userapp.tornado
import base_handler

io_loop = tornado.ioloop.IOLoop.instance()
config_path = "config"

ENABLE_FACEBOOK_FEED = False


def ioloop_wrapper(callback):
    def func(*args, **kwargs):
        io_loop.add_callback(callback, *args, **kwargs)

    return func


ddb = {"user": {
    "tommy@gmail.com":
        {
            "nom": "Tommy DuPoisson",
            "email": "tommy@gmail.com",
            "character":
                {
                    "Martin le chasseur": {"faction": "Les chasseurs", "sous_faction": "", "race": "Humain",
                                           "karma": 10, "bloc_production": {"enchantement": 4, "potion": 2},
                                           "endurance": {"total": 3, "xp": 1}
                                           },
                }
        },
    "eric@gmail.com":
        {
            "nom": "Éric DuPoisson",
            "email": "eric@gmail.com",
            "character":
                {
                    "Martin le chasseur 2": {"faction": "Les chasseurs", "sous_faction": "", "race": "Humain",
                                             "karma": 10, "bloc_production": {"enchantement": 4, "potion": 2},
                                             "endurance": {"total": 3, "xp": 1}
                                             },
                }
        },
    "rick@gmail.com":
        {
            "nom": "Rick DuPoisson",
            "email": "rick@gmail.com",
            "character":
                {
                    "Martin le chasseur 3": {"faction": "Les chasseurs", "sous_faction": "", "race": "Humain",
                                             "karma": 10, "bloc_production": {"enchantement": 4, "potion": 2},
                                             "endurance": {"total": 3, "xp": 1}
                                             },
                    "Martin le chasseur 4": {"faction": "Les chasseurs", "sous_faction": "", "race": "Humain",
                                             "karma": 10, "bloc_production": {"enchantement": 4, "potion": 2},
                                             "endurance": {"total": 3, "xp": 1}
                                             },
                    "Martin le chasseur 5": {"faction": "Les chasseurs", "sous_faction": "", "race": "Humain",
                                             "karma": 10, "bloc_production": {"enchantement": 4, "potion": 2},
                                             "endurance": {"total": 3, "xp": 1}
                                             }
                }
        }
}}


class IndexHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        self.render('news.html', enable_facebook_feed=ENABLE_FACEBOOK_FEED, **self._global_arg)


class LoginHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        self.render('login.html', **self._global_arg)

    @tornado.web.asynchronous
    def post(self):
        email = self.get_argument("username")
        name = self.get_argument("name")
        password = self.get_argument("password")
        if self.get_secure_cookie("user"):
            print("Need to logout before login or sign in.", file=sys.stderr)
            return
        if not email:
            print("User name is empty.", file=sys.stderr)
        if not password:
            print("Password is empty.", file=sys.stderr)
        secure_pass = hashlib.sha256(password.encode('UTF-8')).hexdigest()
        if name:
            user = self._db.create_user(email, name, secure_pass)
        else:
            user = self._db.get_user(email, secure_pass)

        if user:
            uuid = user.get("uuid")
            if uuid:
                self.set_secure_cookie("user", uuid)
        self.redirect("/")


class LogoutHandler(base_handler.BaseHandler):
    def get(self):
        self.clear_cookie("user")
        self.redirect(u"/")


class AdminHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    @userapp.tornado.authorized()
    @userapp.tornado.has_permission('admin')
    def get(self):
        self.render('admin/index.html', **self._global_arg)


class CharacterHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        self.render('character.html', **self._global_arg)


class CharacterViewHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        data = json.dumps(ddb)
        self.write(data)
        self.finish()
