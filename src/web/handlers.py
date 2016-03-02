#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import tornado
from sockjs.tornado import SockJSConnection
import hashlib
import sys

io_loop = tornado.ioloop.IOLoop.instance()
config_path = "config"

ENABLE_FACEBOOK_FEED = False


class BaseHandler(tornado.web.RequestHandler):
    def get_current_user(self):
        return self.get_secure_cookie("user")


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
    def initialize(self, **kwargs):
        pass

    @tornado.web.asynchronous
    def get(self):
        self.render('news.html', enable_facebook_feed=ENABLE_FACEBOOK_FEED)


class LoginHandler(BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        self.render('login.html')

    @tornado.web.asynchronous
    def post(self):
        username = self.get_argument("username")
        password = self.get_argument("password")
        if not username:
            print("User name is empty.", file=sys.stderr)
        if not password:
            print("Password is empty.", file=sys.stderr)
        secure_pass = hashlib.sha256(password.encode('UTF-8'))
        print("secure password %s" % secure_pass.hexdigest())
        # self.set_secure_cookie("user", self.get_argument("name"))
        self.redirect("/")


class LogoutHandler(BaseHandler):
    def get(self):
        self.clear_cookie("user")
        self.redirect(u"/")


class AdminHandler(BaseHandler):
    def initialize(self, **kwargs):
        pass

    @tornado.web.asynchronous
    def get(self):
        self.render('admin/index.html')


class CharacterViewHandler(BaseHandler):
    def initialize(self, **kwargs):
        pass

    @tornado.web.asynchronous
    def get(self):
        data = json.dumps(ddb)
        self.write(data)
        self.finish()
