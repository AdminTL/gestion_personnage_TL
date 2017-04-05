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
from py_class.keys import Keys
import uuid

DEFAULT_SSL_DIRECTORY = os.path.join("..", "..", "ssl_cert")
CERT_FILE_SSL = os.path.join(DEFAULT_SSL_DIRECTORY, "ca.csr")
KEY_FILE_SSL = os.path.join(DEFAULT_SSL_DIRECTORY, "ca.key")


def main(parse_arg):
    socket_connection = SockJSRouter(web_socket.TestStatusConnection, '/update_user', user_settings=None)

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

    url = "http{2}://{0}:{1}".format(parse_arg.listen.address, parse_arg.listen.port, "s" if ssl_options else "")
    keys = Keys(parse_arg)
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
                "disable_login": parse_arg.disable_login,
                "url": url,
                "cookie_secret": uuid.uuid4().hex,
                "google_oauth": keys.get("google_oauth"),
                "facebook_api_key": keys.get("facebook_api_key"),
                "facebook_secret": keys.get("facebook_secret"),
                "twitter_consumer_key": keys.get("twitter_consumer_key"),
                "twitter_consumer_secret": keys.get("twitter_consumer_secret"),
                }
    routes = [
        # To create parameters: /(?P<param1>[^\/]+)/?(?P<param2>[^\/]+)/?
        # Add ? after ) to make a parameter optionnal

        # pages
        tornado.web.url(r"/?", handlers.IndexHandler, name='index', kwargs=settings),
        tornado.web.url(r"/login/?", handlers.LoginHandler, name='login', kwargs=settings),
        tornado.web.url(r"/logout/?", handlers.LogoutHandler, name='logout', kwargs=settings),
        tornado.web.url(r"/admin/?", handlers.AdminHandler, name='admin', kwargs=settings),
        tornado.web.url(r"/profile/?(?P<user_id>[^\/]+)?/?", handlers.ProfileHandler, name='profile', kwargs=settings),
        tornado.web.url(r"/character/?", handlers.CharacterHandler, name='character', kwargs=settings),
        tornado.web.url(r"/manual/?", handlers.ManualPageHandler, name='manual', kwargs=settings),
        tornado.web.url(r"/lore/?", handlers.LorePageHandler, name='lore', kwargs=settings),

        # command
        tornado.web.url(r"/cmd/character_view/?", handlers.CharacterViewHandler, name='character_view', kwargs=settings),
        tornado.web.url(r"/cmd/manual/?", handlers.ManualHandler, name='cmd_manual', kwargs=settings),
        tornado.web.url(r"/cmd/lore/?", handlers.LoreHandler, name='cmd_lore', kwargs=settings),
        tornado.web.url(r"/cmd/rule/?", handlers.RulesHandler, name='cmd_rule', kwargs=settings),
        tornado.web.url(r"/cmd/auth/validate/?", handlers.ValidateAuthHandler, name='validate_auth', kwargs=settings),
        tornado.web.url(r"/cmd/auth/google/?", handlers.GoogleOAuth2LoginHandler, name='google_login', kwargs=settings),
        tornado.web.url(r"/cmd/auth/facebook/?", handlers.FacebookGraphLoginHandler, name='facebook_login', kwargs=settings),
        tornado.web.url(r"/cmd/auth/twitter/?", handlers.TwitterLoginHandler, name='twitter_login', kwargs=settings),
    ]
    application = tornado.web.Application(routes + socket_connection.urls, **settings)

    io_loop = tornado.ioloop.IOLoop.instance()

    http_server = tornado.httpserver.HTTPServer(application, ssl_options=ssl_options, io_loop=io_loop)
    http_server.listen(port=parse_arg.listen.port)

    print("Using Tornado "+tornado.version)
    if tornado.version_info < (4,4,3,0): print("WARNING: Please upgrade to version 4.4.3 or higher for Facebook authentification.")
    print('Starting server at {0}'.format(url))

    if parse_arg.open_browser:
        # open a URL, if possible on new tab
        webbrowser.open(url, new=2)

    try:
        io_loop.start()
    except KeyboardInterrupt:
        io_loop.stop()
        io_loop.close()
