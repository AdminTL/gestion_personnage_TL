#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from sockjs.tornado import SockJSConnection


# TODO this web socket is not used
class WebSocket:
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


# TODO bad technique!
open_connexions = WebSocket()


class TestStatusConnection(SockJSConnection):
    def __init__(self, *args, **kwargs):
        super(TestStatusConnection, self).__init__(*args, **kwargs)

    def on_open(self, info):
        pass

    def on_close(self):
        open_connexions.remove(self)
        return super(TestStatusConnection, self).on_close()
