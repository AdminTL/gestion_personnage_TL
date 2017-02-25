#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import webbrowser
import tornado
import tornado.ioloop
import tornado.web
import tornado.httpserver
import handlers
from py_class import web_socket
from sockjs.tornado import SockJSRouter
import os
import subprocess
import base64
from py_class.db import DB
from py_class.manual import Manual
from py_class.lore import Lore

DEFAULT_SSL_DIRECTORY = os.path.join("..", "..", "ssl_cert")
CERT_FILE_SSL = os.path.join(DEFAULT_SSL_DIRECTORY, "ca.csr")
KEY_FILE_SSL = os.path.join(DEFAULT_SSL_DIRECTORY, "ca.key")


def main(parse_arg):
    socket_connection = SockJSRouter(web_socket.TestStatusConnection, '/update_user', user_settings=None)

    # TODO store cookie_secret if want to reuse it if restart server
    settings = {"static_path": parse_arg.static_dir,
                "template_path": parse_arg.template_dir,
                "debug": parse_arg.debug,
                "cookie_secret": base64.b64encode(os.urandom(50)).decode('ascii'),
                "login_url": "/login",
                "use_internet_static": parse_arg.use_internet_static,
                "db": DB(parse_arg),
                "manual": Manual(parse_arg),
                "lore": Lore(parse_arg),
                "disable_character": parse_arg.disable_character,
                "disable_admin": parse_arg.disable_admin,
                "disable_login": parse_arg.disable_login
                }
    routes = [
        # pages
        tornado.web.url(r"/", handlers.IndexHandler, name='index', kwargs=settings),
        tornado.web.url(r"/login", handlers.LoginHandler, name='login', kwargs=settings),
        tornado.web.url(r"/logout", handlers.LogoutHandler, name='logout', kwargs=settings),
        tornado.web.url(r"/admin", handlers.AdminHandler, name='admin', kwargs=settings),
        tornado.web.url(r"/character", handlers.CharacterHandler, name='character', kwargs=settings),
        tornado.web.url(r"/manual", handlers.ManualPageHandler, name='manual', kwargs=settings),
        tornado.web.url(r"/lore", handlers.LorePageHandler, name='lore', kwargs=settings),

        # command
        tornado.web.url(r"/cmd/character_view", handlers.CharacterViewHandler, name='character_view', kwargs=settings),
        tornado.web.url(r"/cmd/manual", handlers.ManualHandler, name='cmd_manual', kwargs=settings),
        tornado.web.url(r"/cmd/lore", handlers.LoreHandler, name='cmd_lore', kwargs=settings),
    ]
    application = tornado.web.Application(routes + socket_connection.urls, **settings)

    ssl_options = None
    if parse_arg.ssl:
        # use https if active ssl, secure http
        if not os.path.isfile(CERT_FILE_SSL) or not os.path.isfile(KEY_FILE_SSL):
            # Generate a self-signed certificate and key if we don't already have one.
            cmd = 'openssl req -x509 -sha256 -newkey rsa:2048 -keyout %s -out %s -days 36500 -nodes -subj' % (
                KEY_FILE_SSL, CERT_FILE_SSL)
            cmd_in = cmd.split() + ["/C=CA/ST=QC/L=Montreal/O=Traitre-lame/OU=gn.qc.ca"]

            subprocess.call(cmd_in)

        ssl_options = {"certfile": CERT_FILE_SSL, "keyfile": KEY_FILE_SSL}

    io_loop = tornado.ioloop.IOLoop.instance()

    http_server = tornado.httpserver.HTTPServer(application, ssl_options=ssl_options, io_loop=io_loop)
    http_server.listen(port=parse_arg.listen.port)

    url = "http{2}://{0}:{1}".format(parse_arg.listen.address, parse_arg.listen.port, "s" if ssl_options else "")
    print('Starting server at {0}'.format(url))

    if parse_arg.open_browser:
        # open a URL, if possible on new tab
        webbrowser.open(url, new=2)

    try:
        io_loop.start()
    except KeyboardInterrupt:
        io_loop.stop()
        io_loop.close()
