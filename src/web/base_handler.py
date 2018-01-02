#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import tornado.web
import sys


class BaseHandler(tornado.web.RequestHandler):
    _debug = None
    _manual = None
    _lore = None
    _db = None
    _invalid_login = None
    _global_arg = {}

    def initialize(self, **kwargs):
        self._debug = kwargs.get("debug")
        self._db = kwargs.get("db")
        self._manual = kwargs.get("manual")
        self._lore = kwargs.get("lore")
        self._invalid_login = self.get_argument("invalid",
                                                default="disable_login" if kwargs.get("disable_login") else None)
        self._global_arg = {
            "debug": self._debug,
            "use_internet_static": kwargs.get("use_internet_static"),
            "db": self._db,
            "disable_character": kwargs.get("disable_character"),
            "disable_admin": kwargs.get("disable_admin"),
            "disable_login": kwargs.get("disable_login"),
            "url": kwargs.get("url"),
            "invalid_login": self._invalid_login
        }

    def get_current_user(self):
        user_cookie = self.get_secure_cookie("user")
        if not user_cookie:
            return
        # trim private data
        user_id = eval(user_cookie).get("user_id")
        return self._db.get_user(id_type="user", user_id=user_id)

    def give_cookie(self, user_id, twitter_access_token=None, facebook_access_token=None, google_access_token=None):
        if user_id:
            data = str({"user_id": user_id,
                        "twitter_access_token": twitter_access_token,
                        "facebook_access_token": facebook_access_token,
                        "google_access_token": google_access_token})
            self.set_secure_cookie("user", data)
            self.redirect("/")
        else:
            print("User doesn't have an id.", file=sys.stderr)
