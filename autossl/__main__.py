#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import tornado.ioloop
import tornado.web
import os
import sys

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        files = os.listdir("autossl/acme-challenge")
        first_file = open('autossl/acme-challenge/' + files[0], 'r')
        self.write(first_file.read())

        # Stop the server since it's only used for one test
        tornado.ioloop.IOLoop.current().stop()

def make_app():
    return tornado.web.Application([
        (r".*", MainHandler),
    ])

if __name__ == "__main__":
    app = make_app()
    print("Starting listener on port 80. This won't work if you currently have a web server running on port 80!")

    # TODO: Only accept connections from the LE server
    try:
        app.listen(80)
        tornado.ioloop.IOLoop.current().start()
        print("Tornado request processed, ending web server.")
    except:
        print("Error! This probably means we couldn't bind to port 80. Either something's already bound to it, or we don't have root.")
