#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import tornado
import tornado.web
from sockjs.tornado import SockJSConnection
import hashlib
import sys
from db import TLDB
import userapp
import userapp.tornado

USER_APP_ID = "56d6ef67bce81"

io_loop = tornado.ioloop.IOLoop.instance()
config_path = "config"

ENABLE_FACEBOOK_FEED = False
DATABASE_PATH = "../../database/tl_user.json"
db = TLDB(DATABASE_PATH)


@userapp.tornado.config(app_id=USER_APP_ID)
class BaseHandler(tornado.web.RequestHandler):
    _debug = None
    _global_arg = {}

    def initialize(self, **kwargs):
        self._debug = kwargs.get("debug")
        self._global_arg = {"debug": kwargs.get("debug"), "use_internet_static": kwargs.get("use_internet_static")}

    def get_current_user(self):
        return db.get_user(_uuid=self.get_secure_cookie("user"))


class SocketCommunication:
    def __init__(self):
        self._connexions = []

    def broadcast_update(self, json_data):
        # print("SockJS broadcast : {}".format(json_data))
        for client in self._connexions:
            client.broadcast(self._connexions, json_data)

    def append(self, conn):
        self._connexions.append(conn)

    def remove(self, conn):
        self._connexions.remove(conn)


open_connexions = SocketCommunication()


class TestStatusConnection(SockJSConnection):
    def __init__(self, *args, **kwargs):
        super(TestStatusConnection, self).__init__(*args, **kwargs)

    def on_open(self, info):
        pass

    def on_close(self):
        open_connexions.remove(self)
        return super(TestStatusConnection, self).on_close()


def ioloop_wrapper(callback):
    def func(*args, **kwargs):
        io_loop.add_callback(callback, *args, **kwargs)

    return func


ddb = {"user":
           {"tommy@gmail.com":
                {"character":
                     {"Martin le chasseur": {"faction": "Les chasseurs", "sous-faction": "", "race": "Humain",
                                             "karma": 10, "block_production": {"enchantement": 4, "potion": 2},
                                             "endurance": {"total": 3, "xp": 1}
                                             },
                      "nom": "Éric DuPoisson",
                      "email": "tommy@gmail.com"
                      },
                 }
            }
       }


class IndexHandler(BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        self.render('news.html', enable_facebook_feed=ENABLE_FACEBOOK_FEED, **self._global_arg)


class LoginHandler(BaseHandler):
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
            user = db.create_user(email, name, secure_pass)
        else:
            user = db.get_user(email, secure_pass)

        if user:
            uuid = user.get("uuid")
            if uuid:
                self.set_secure_cookie("user", uuid)
        self.redirect("/")


class LogoutHandler(BaseHandler):
    def get(self):
        self.clear_cookie("user")
        self.redirect(u"/")


class AdminHandler(BaseHandler):
    @tornado.web.asynchronous
    @userapp.tornado.authorized()
    @userapp.tornado.has_permission('admin')
    def get(self):
        self.render('admin/index.html', **self._global_arg)


class CharacterHandler(BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        self.render('character.html', **self._global_arg)


class CharacterViewHandler(BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        data = json.dumps(ddb)
        self.write(data)
        self.finish()
