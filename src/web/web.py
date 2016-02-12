#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import webbrowser
import tornado
import tornado.ioloop
import tornado.web
import handlers
from sockjs.tornado import SockJSRouter


def make_app(debug, static_dir, template_dir):
    rpc = None
    socket_connection = SockJSRouter(handlers.TestStatusConnection,
                                     '/update_user',
                                     user_settings=None)
    application = tornado.web.Application(
        [
            tornado.web.url(r"/", handlers.Index, {'rpc': rpc}, name='index'),
        ] + socket_connection.urls,
        static_path=static_dir,
        template_path=template_dir,
        debug=debug)

    return application


def main(debug, static_dir, template_dir, listen):
    application = make_app(debug, static_dir, template_dir)
    application.listen(address=listen.address, port=listen.port)

    url = "http://{0}:{1}".format(listen.address, listen.port)
    print('Starting server at {0}'.format(url))

    # open a URL, if possible on new tab
    webbrowser.open(url, new=2)

    ioloop = tornado.ioloop.IOLoop.instance()
    try:
        ioloop.start()
    except KeyboardInterrupt:
        ioloop.stop()
        ioloop.close()
