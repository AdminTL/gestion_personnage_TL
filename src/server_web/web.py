#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import webbrowser
import tornado
import tornado.ioloop
import tornado.web
import tornado.httpserver

from handler import auto_ssl_handler
from handler import admin_handler
from handler import archive_handler
from handler import character_handler
from handler import editor_handler
from handler import index_handler
from handler import login_handler
from handler import model_handler
from handler import profile_handler
# from component import web_socket
# from sockjs.tornado import SockJSRouter

from component.db import DB
from component.model import Model
from component.doc_generator.doc_generator_gspread import DocGeneratorGSpread
from component.project_archive import ProjectArchive
from component.character_form import CharacterForm
from tornado.log import enable_pretty_logging


def main(parse_arg):
    if parse_arg.debug:
        enable_pretty_logging()

    # socket_connection = SockJSRouter(web_socket.TestStatusConnection, prefix='/update_user')
    http_secure = parse_arg.http_secure
    auth_keys = parse_arg.auth_keys

    settings = {"template_path": parse_arg.template_dir,
                "debug": parse_arg.debug,
                "use_internet_static": parse_arg.use_internet_static,
                "db": DB(parse_arg),
                "model": Model(parse_arg),
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
                "http_secure": http_secure,
                "login_url": "/login",
                "cookie_secret": auth_keys.get("cookie_secret"),
                "auth_token": parse_arg.auth_token
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

        # Command
        # TODO /cmd/character_form
        tornado.web.url(r"/cmd/character_form/?", character_handler.CharacterFormHandler, name='character_form',
                        kwargs=settings),
        tornado.web.url(r"/cmd/character_view/?", character_handler.CharacterViewHandler, name='character_view',
                        kwargs=settings),
        tornado.web.url(r"/cmd/model/?", model_handler.ModelHandler, name='cmd_model', kwargs=settings),
        tornado.web.url(r"/cmd/admin/model/?", model_handler.ModelAdminHandler, name='cmd_model_admin',
                        kwargs=settings),
        tornado.web.url(r"/cmd/stat/total_season_pass/?", index_handler.StatSeasonPass,
                        name='cmd_stat_total_season_pass',
                        kwargs=settings),
        tornado.web.url(r"/cmd/character_approbation/?", character_handler.CharacterApprobationHandler,
                        name='cmd_character_approbation', kwargs=settings),

        # Profile
        tornado.web.url(r"/cmd/profile/update_password/?", profile_handler.ProfileCmdUpdatePasswordHandler,
                        name='cmd_profile_update_password', kwargs=settings),
        tornado.web.url(r"/cmd/profile/add_new_password/?", profile_handler.ProfileCmdAddNewPasswordHandler,
                        name='cmd_profile_add_new_password', kwargs=settings),
        tornado.web.url(r"/cmd/profile/get_info/?", profile_handler.ProfileCmdInfoHandler,
                        name='cmd_profile_get_info', kwargs=settings),

        # Editor
        tornado.web.url(r"/cmd/editor/get_info/?", editor_handler.EditorCmdInfoHandler,
                        name='cmd_editor_get_info', kwargs=settings),
        tornado.web.url(r"/cmd/editor/add_generator_share/?", editor_handler.EditorCmdAddGeneratorShareHandler,
                        name='cmd_editor_add_generator_share', kwargs=settings),
        tornado.web.url(r"/cmd/editor/generate_and_save/?", editor_handler.EditorCmdGenerateAndSaveHandler,
                        name='cmd_editor_generate_and_save', kwargs=settings),
        tornado.web.url(r"/cmd/editor/update_file_url/?", editor_handler.EditorCmdUpdateFileUrlHandler,
                        name='cmd_editor_update_file_url', kwargs=settings),

        # Archive
        tornado.web.url(r"/cmd/archive/generate_project", archive_handler.SettingArchiveGenerateProjectHandler,
                        name='generate_project_archive', kwargs=settings),

        # Auto ssl
        tornado.web.url(r"/.well-known/acme-challenge.*", auto_ssl_handler.AutoSSLHandler, name="auto_ssl"),
    ]

    if not parse_arg.disable_login:
        routes.append(tornado.web.url(r"/cmd/auth/validate/?", login_handler.ValidateAuthHandler, name='validate_auth',
                                      kwargs=settings))
        routes.append(tornado.web.url(r"/cmd/auth/google/?", login_handler.GoogleOAuth2LoginHandler,
                                      name='google_login', kwargs=settings))
        routes.append(tornado.web.url(r"/cmd/auth/facebook/?", login_handler.FacebookGraphLoginHandler,
                                      name='facebook_login', kwargs=settings))
        routes.append(tornado.web.url(r"/cmd/auth/twitter/?", login_handler.TwitterLoginHandler, name='twitter_login',
                                      kwargs=settings))
        routes.append(tornado.web.url(r"/user/authenticate", login_handler.UserAuthenticate, name='user_authenticate',
                                      kwargs=settings))
        routes.append(tornado.web.url(r"/user/register", login_handler.UserRegister, name='user_register',
                                      kwargs=settings))
        routes.append(tornado.web.url(r"/user/current", login_handler.User, name='user', kwargs=settings))
        routes.append(tornado.web.url(r"/user/logout", login_handler.UserLogout, name='user_logout', kwargs=settings))

    # Content files in the dist folder (js, css, images)
    routes.append(
        tornado.web.url(r'/((?:.*)\.(?:txt|jpg|png|ico|woff2|svg|ttf|eot|woff|gif|js|json))/?',
                        tornado.web.StaticFileHandler, kwargs={'path': parse_arg.template_dir}))

    # Angular pages
    routes.append(tornado.web.url(r'/(?:.*)/?', index_handler.IndexHandler, kwargs=settings))

    # application = tornado.web.Application(routes + socket_connection.urls, **settings)
    application = tornado.web.Application(routes, **settings)
    if http_secure.has_enable_redirect_http_to_https():
        application.listen(http_secure.get_http_port())

    http_server = tornado.httpserver.HTTPServer(application, ssl_options=http_secure.get_ssl_options())
    http_server.listen(port=http_secure.get_main_port())

    if tornado.version_info < (5, 0):
        print("WARNING: Using Tornado %s. Please upgrade to version 5.0 or higher." % tornado.version)

    print('Starting server at {0}'.format(http_secure.get_url()))

    if parse_arg.open_browser:
        # open a URL, if possible on new tab
        webbrowser.open(http_secure.get_url(), new=2)

    try:
        tornado.ioloop.IOLoop.current().start()
    except KeyboardInterrupt:
        tornado.ioloop.IOLoop.current().stop()
        tornado.ioloop.IOLoop.current().close()
