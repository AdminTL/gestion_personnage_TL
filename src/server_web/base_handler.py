#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import tornado.web
import sys
import json


class BaseHandler(tornado.web.RequestHandler):
    def data_received(self, chunk):
        raise NotImplementedError()

    _debug = None
    _manual = None
    _model = None
    _character_form = None
    _db = None
    _invalid_login = None
    _config = None
    _doc_generator_gspread = None
    _project_archive = None
    _http_secure = None
    _global_arg = {}

    def initialize(self, **kwargs):
        self._debug = kwargs.get("debug")
        self._db = kwargs.get("db")
        self._manual = kwargs.get("manual")
        self._model = kwargs.get("model")
        self._character_form = kwargs.get("character_form")
        self._invalid_login = self.get_argument("invalid",
                                                default="disable_login" if kwargs.get("disable_login") else None)
        self._config = kwargs.get("config")
        self._doc_generator_gspread = kwargs.get("doc_generator_gspread")
        self._project_archive = kwargs.get("project_archive")
        self._http_secure = kwargs.get("http_secure")

        self._global_arg = {
            "debug": self._debug,
            "use_internet_static": kwargs.get("use_internet_static"),
            "db": self._db,
            "disable_character": kwargs.get("disable_character"),
            "disable_user_character": kwargs.get("disable_user_character"),
            "disable_admin": kwargs.get("disable_admin"),
            "disable_login": kwargs.get("disable_login"),
            "hide_menu_login": kwargs.get("hide_menu_login"),
            "disable_custom_css": kwargs.get("disable_custom_css"),
            "invalid_login": self._invalid_login,
            "url": self._http_secure.get_url()
        }

    @tornado.web.asynchronous
    def prepare(self):
        if self._http_secure and self._http_secure.has_enable_redirect_http_to_https() and \
                self.request.protocol == 'http':
            # self.redirect('https://' + self.request.host, permanent=False)
            # use url from __main__ argument
            url = self._http_secure.get_url() + self.request.uri

            self.redirect(url, permanent=True)
        elif self._http_secure.has_enable_redirect_http_to_https() and self.request.protocol == 'https' and \
                self._http_secure.get_http_port() == 80:
            # 3 months in second
            max_time = 2628000

            self.set_header('X-FRAME-OPTIONS', 'Deny')
            self.set_header('X-XSS-Protection', '1; mode=block')
            self.set_header('X-Content-Type-Options', 'nosniff')
            self.set_header('Strict-Transport-Security', 'max-age=%s; includeSubdomains' % max_time)

    def get_current_user(self):
        user_cookie = self.get_secure_cookie("user")
        if not user_cookie:
            return

        # trim private data
        data = json.loads(user_cookie.decode("utf-8"))
        if type(data) is dict:
            user_id = data.get("user_id")
            return self._db.get_user(id_type="user", user_id=user_id)
        else:
            print("Error type on cookie %s %s" % (data, self.request.remote_ip), file=sys.stderr)

    def is_permission_admin(self):
        return self.current_user and self.current_user.get("permission") == "Admin"

    def is_user_id(self, user_id):
        return self.current_user and self.current_user.get("user_id") == user_id

    def give_cookie(self, user_id, twitter_access_token=None, facebook_access_token=None, google_access_token=None):
        if user_id:
            data = {
                "user_id": user_id,
                "twitter_access_token": twitter_access_token,
                "facebook_access_token": facebook_access_token,
                "google_access_token": google_access_token
            }
            serialize_data = json.dumps(data)
            self.set_secure_cookie("user", serialize_data)
            self.redirect("/")
        else:
            print("User doesn't have an id.", file=sys.stderr)
            # Bad Request
            self.set_status(400)
            self.send_error(400)
            raise tornado.web.Finish()
