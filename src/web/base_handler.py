#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import userapp.tornado

import tornado.web
import user


@userapp.tornado.config(app_id=user.USER_APP_ID)
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
            "db": self._db
        }

    def get_current_user(self):
        return self._db.get_user(_uuid=self.get_secure_cookie("user"))
