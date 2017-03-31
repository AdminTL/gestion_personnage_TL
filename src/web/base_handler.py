#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import tornado.web
import json
from py_class import db

class BaseHandler(tornado.web.RequestHandler):
    _debug = None
    _rule = None
    _db = None
    _global_arg = {}

    def initialize(self, **kwargs):
        self._debug = kwargs.get("debug")
        self._db = kwargs.get("db")
        self._rule = kwargs.get("rule")
        self._global_arg = {
            "debug": kwargs.get("debug"),
            "use_internet_static": kwargs.get("use_internet_static"),
            "db": self._db,
            "disable_character": kwargs.get("disable_character"),
            "disable_admin": kwargs.get("disable_admin"),
            "disable_login": kwargs.get("disable_login")
        }

    def get_current_user(self):
        user_cookie = self.get_secure_cookie("user")
        return self._db.get_user(user_id=user_cookie) if user_cookie else None
