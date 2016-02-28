#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import tornado
from sockjs.tornado import SockJSConnection

io_loop = tornado.ioloop.IOLoop.instance()
config_path = "config"


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
                                             "karma": 10}
                      },
                 "nom": "Éric DuPoisson",
                 "email": "tommy@gmail.com"
                 },
            }
       }


class Index(tornado.web.RequestHandler):
    def initialize(self, **kwargs):
        pass

    @tornado.web.asynchronous
    def get(self):
        self.render('index.html', hello='Hello, world')


class CharacterView(tornado.web.RequestHandler):
    def initialize(self, **kwargs):
        pass

    @tornado.web.asynchronous
    def get(self):
        data = json.dumps(ddb)
        self.write(data)
        self.finish()
