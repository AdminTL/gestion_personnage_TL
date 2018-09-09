#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import webbrowser
import tornado
import tornado.ioloop
import tornado.web
import tornado.httpserver
import handlers
# from py_class import web_socket
# from sockjs.tornado import SockJSRouter
import ssl
import os
import stat
import sys
from py_class.db import DB
from py_class.manual import Manual
from py_class.lore import Lore
from py_class.doc_generator.doc_generator_gspread import DocGeneratorGSpread
from py_class.auth_keys import AuthKeys
from py_class.project_archive import ProjectArchive
from py_class.character_form import CharacterForm

WEB_ROOT_DIR = os.path.dirname(os.path.realpath(__file__))
DEFAULT_SSL_DIRECTORY = os.path.join(WEB_ROOT_DIR, "..", "..", "ssl_cert", "certs")


def main(parse_arg):
    # socket_connection = SockJSRouter(web_socket.TestStatusConnection, prefix='/update_user')

    ssl_options = None
    if parse_arg.ssl:
        # ssl cert suppose to be in hostname directory
        cert_file = os.path.join(DEFAULT_SSL_DIRECTORY, parse_arg.listen.address, "fullchain.pem")
        key_file = os.path.join(DEFAULT_SSL_DIRECTORY, parse_arg.listen.address, "privkey.pem")

        # stop server if permission is wrong, different of 600
        for path_cert in [cert_file, key_file]:
            permission = oct(os.stat(path_cert)[stat.ST_MODE])[-3:]
            if permission != "600":
                print("Error, expect permission 600 and got %s to file %s" % (permission, path_cert))
                sys.exit(-1)

        ssl_options = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
        if os.path.isfile(cert_file) and os.path.isfile(key_file):
            ssl_options.load_cert_chain(certfile=cert_file, keyfile=key_file)

    host = parse_arg.listen.address
    port = parse_arg.listen.port

    if parse_arg.redirect_http_to_https:
        if port == 80:
            ssl_port = 443
        else:
            ssl_port = port + 1
    else:
        # force to use only https
        if port == 80:
            ssl_port = 443
        else:
            ssl_port = port

    if ssl_options:
        if ssl_port == 443:
            url = "https://{0}".format(host)
        else:
            url = "https://{0}:{1}".format(host, ssl_port)
    else:
        if port == 80:
            url = "http://{0}".format(host)
        else:
            url = "http://{0}:{1}".format(host, port)

    auth_keys = AuthKeys(parse_arg)

    # TODO store cookie_secret if want to reuse it if restart server
    settings = {"static_path": parse_arg.static_dir,
                "template_path": parse_arg.template_dir,
                "debug": parse_arg.debug,
                "use_internet_static": parse_arg.use_internet_static,
                "db": DB(parse_arg),
                "manual": Manual(parse_arg),
                "lore": Lore(parse_arg),
                "character_form": CharacterForm(parse_arg),
                "doc_generator_gspread": DocGeneratorGSpread(parse_arg),
                "project_archive": ProjectArchive(parse_arg),
                "disable_character": parse_arg.disable_character,
                "disable_user_character": parse_arg.disable_user_character,
                "disable_admin": parse_arg.disable_admin,
                "disable_login": parse_arg.disable_login,
                "config": parse_arg.config,
                "hide_menu_login": parse_arg.hide_menu_login,
                "disable_custom_css": parse_arg.disable_custom_css,
                "url": url,
                "port": port,
                "redirect_http_to_https": parse_arg.redirect_http_to_https,
                "login_url": "/login",
                "cookie_secret": auth_keys.get("cookie_secret", auto_gen=True),
                # TODO add xsrf_cookies
                # "xsrf_cookies": True,
                }

    if not parse_arg.disable_login:
        settings["google_oauth"] = auth_keys.get("google_oauth")
        settings["facebook_api_key"] = auth_keys.get("facebook_api_key")
        settings["facebook_secret"] = auth_keys.get("facebook_secret")
        settings["twitter_consumer_key"] = auth_keys.get("twitter_consumer_key")
        settings["twitter_consumer_secret"] = auth_keys.get("twitter_consumer_secret")

    routes = [
        # To create parameters: /(?P<param1>[^\/]+)/?(?P<param2>[^\/]+)/?
        # Add ? after ) to make a parameter optional

        # Admin web page
        tornado.web.url(r"/admin/character?", handlers.AdminCharacterHandler, name='admin character', kwargs=settings),
        tornado.web.url(r"/admin/editor?", handlers.AdminEditorHandler, name='admin editor', kwargs=settings),
        tornado.web.url(r"/admin/setting?", handlers.AdminSettingHandler, name='admin setting', kwargs=settings),

        # Command
        # TODO /cmd/character_form
        tornado.web.url(r"/cmd/character_form/?", handlers.CharacterFormHandler, name='character_form', kwargs=settings),
        tornado.web.url(r"/cmd/character_view/?", handlers.CharacterViewHandler, name='character_view', kwargs=settings),
        tornado.web.url(r"/cmd/manual/?", handlers.ManualHandler, name='cmd_manual', kwargs=settings),
        tornado.web.url(r"/cmd/lore/?", handlers.LoreHandler, name='cmd_lore', kwargs=settings),
        tornado.web.url(r"/cmd/stat/total_season_pass/?", handlers.StatSeasonPass, name='cmd_stat_total_season_pass',
                        kwargs=settings),

        # Profile
        tornado.web.url(r"/cmd/profile/update_password/?", handlers.ProfileCmdUpdatePasswordHandler,
                        name='cmd_profile_update_password', kwargs=settings),
        tornado.web.url(r"/cmd/profile/add_new_password/?", handlers.ProfileCmdAddNewPasswordHandler,
                        name='cmd_profile_add_new_password', kwargs=settings),
        tornado.web.url(r"/cmd/profile/get_info/?", handlers.ProfileCmdInfoHandler,
                        name='cmd_profile_get_info', kwargs=settings),

        # Editor
        tornado.web.url(r"/cmd/editor/get_info/?", handlers.EditorCmdInfoHandler,
                        name='cmd_editor_get_info', kwargs=settings),
        tornado.web.url(r"/cmd/editor/add_generator_share/?", handlers.EditorCmdAddGeneratorShareHandler,
                        name='cmd_editor_add_generator_share', kwargs=settings),
        tornado.web.url(r"/cmd/editor/generate_and_save/?", handlers.EditorCmdGenerateAndSaveHandler,
                        name='cmd_editor_generate_and_save', kwargs=settings),
        tornado.web.url(r"/cmd/editor/update_file_url/?", handlers.EditorCmdUpdateFileUrlHandler,
                        name='cmd_editor_update_file_url', kwargs=settings),

        # Archive
        tornado.web.url(r"/cmd/archive/generate_project", handlers.SettingArchiveGenerateProjectHandler,
                        name='generate_project_archive', kwargs=settings),

        # Auto ssl
        tornado.web.url(r"/.well-known/acme-challenge.*", handlers.AutoSSLHandler, name="auto_ssl"),

        # Content files in the dist folder (js, css, images)
        tornado.web.url(r'/((?:.*)\.(?:txt|png|ico|woff2|svg|ttf|eot|woff|gif|js))/?', tornado.web.StaticFileHandler, kwargs={'path': parse_arg.static_dir}),

        # Angular pages
        tornado.web.url(r'/(?:.*)/?', handlers.IndexHandler, kwargs={'path': parse_arg.static_dir})
    ]

    if not parse_arg.disable_login:
        routes.append(tornado.web.url(r"/cmd/auth/validate/?", handlers.ValidateAuthHandler, name='validate_auth',
                                      kwargs=settings))
        routes.append(tornado.web.url(r"/cmd/auth/google/?", handlers.GoogleOAuth2LoginHandler, name='google_login',
                                      kwargs=settings))
        routes.append(tornado.web.url(r"/cmd/auth/facebook/?", handlers.FacebookGraphLoginHandler,
                                      name='facebook_login', kwargs=settings))
        routes.append(tornado.web.url(r"/cmd/auth/twitter/?", handlers.TwitterLoginHandler, name='twitter_login',
                                      kwargs=settings))

    # application = tornado.web.Application(routes + socket_connection.urls, **settings)
    application = tornado.web.Application(routes, **settings)
    if parse_arg.redirect_http_to_https:
        application.listen(port)

    http_server = tornado.httpserver.HTTPServer(application, ssl_options=ssl_options)
    if ssl_options:
        http_server.listen(port=ssl_port)
    else:
        http_server.listen(port=port)

    if tornado.version_info < (5, 0):
        print("WARNING: Using Tornado %s. Please upgrade to version 5.0 or higher." % tornado.version)

    print('Starting server at {0}'.format(url))

    if parse_arg.open_browser:
        # open a URL, if possible on new tab
        webbrowser.open(url, new=2)

    try:
        tornado.ioloop.IOLoop.current().start()
    except KeyboardInterrupt:
        tornado.ioloop.IOLoop.current().stop()
        tornado.ioloop.IOLoop.current().close()
