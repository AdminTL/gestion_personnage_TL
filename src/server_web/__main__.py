#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# Note: try except import with .(parent), because crash when reload the python.

import argparse
import os
import web
from client.npm import NPM
from client.angular_environment import AngularEnvironment
from component.config import Config

WEB_ROOT_DIR = os.path.dirname(os.path.realpath(__file__))
WEB_DEFAULT_TEMPLATE_DIR = os.path.join(WEB_ROOT_DIR, "dist")
DB_DEFAULT_PATH = os.path.join(WEB_ROOT_DIR, "..", "..", "database", "tl_user.json")
DB_DEMO_PATH = os.path.join(WEB_ROOT_DIR, "..", "..", "database", "demo_user.json")
DB_MANUAL_PATH = os.path.join(WEB_ROOT_DIR, "..", "..", "database", "tl_manual.json")
DB_CHARACTER_FORM_PATH = os.path.join(WEB_ROOT_DIR, "..", "..", "database", "tl_character_form.json")
DB_AUTH_PATH = os.path.join(WEB_ROOT_DIR, "..", "..", "database", "auth.json")
GOOGLE_API_SECRET_PATH = os.path.join(WEB_ROOT_DIR, "..", "..", "database", "client_secret.json")
CONFIG_PATH = os.path.join(WEB_ROOT_DIR, "..", "..", "database", "config.json")
PACKAGE_NPM = os.path.join(WEB_ROOT_DIR, os.pardir, "client_web", "package.json")
ANGULAR_ENVIRONMENT_PATH = os.path.join(WEB_ROOT_DIR, "..", "client_web", "src", "environments", "environment.ts")
ANGULAR_ENVIRONMENT_PROD_PATH = os.path.join(WEB_ROOT_DIR, "..", "client_web", "src", "environments",
                                             "environment.prod.ts")


def main():
    args = parse_args()
    if args.debug:
        print("Arguments:%s" % args)

    ae = AngularEnvironment(args)
    ae.run_from_main()
    # npm = NPM(args)
    # npm.run_from_main()

    # Run web client
    web.main(args)


class Listen:
    # TODO don't hardcoded ip address to bind
    address = "127.0.0.1"
    port = 8000

    def __repr__(self):
        return "'%s:%s'" % (self.address, self.port)


def parse_args():
    parser = argparse.ArgumentParser(description="web server")

    group = parser.add_argument_group("Common")
    group.add_argument('-d', '--debug', default=False, action='store_true',
                       help='Enable debug')
    group.add_argument('--open_browser', default=False, action='store_true',
                       help='Open web browser on tabulation when start server.')
    group.add_argument('--demo', default=False, action='store_true',
                       help='Use demo data instead of generated custom data.')

    group = parser.add_argument_group("Config")
    group.add_argument('-t', '--template_dir', default=WEB_DEFAULT_TEMPLATE_DIR,
                       help='Web: Template files directory')

    group = parser.add_argument_group("DataBase")
    group.add_argument('--db_path', default=DB_DEFAULT_PATH,
                       help='Specify a path for database file.')
    group.add_argument('--db_demo', default=False, action='store_true',
                       help='Enable mode demo on database. '
                            'Cannot save information in real database, only keep in memory.')

    group = parser.add_argument_group("Web")
    group.add_argument('-l', '--web-listen-address', dest='listen', default=Listen(), type=parse_listen,
                       help='Web: Web server listen address')
    group.add_argument('--redirect_http_to_https', default=False, action='store_true',
                       help='Redirect all http request to https, only if ssl is enable. When enable, if port is 80, '
                            'https port will be 443, else the port of https will be http port + 1.')
    group.add_argument('--ssl', default=False, action='store_true',
                       help='Active https.')
    group.add_argument('--use_internet_static', default=False, action='store_true',
                       help='Force use to use static files like css and js from another internet website.'
                            ' Use web browser cache.')

    group = parser.add_argument_group("Module")
    group.add_argument('--disable_character', default=False, action='store_true',
                       help='Active to disable character module.')
    group.add_argument('--disable_user_character', default=False, action='store_true',
                       help='Active to disable character module for not admin user.')
    group.add_argument('--disable_login', default=False, action='store_true',
                       help='Active to disable login module.')
    group.add_argument('--disable_admin', default=False, action='store_true',
                       help='Active to disable admin module.')
    group.add_argument('--disable_custom_css', default=False, action='store_true',
                       help='Active to disable custom css module.')
    group.add_argument('--hide_menu_login', default=False, action='store_true',
                       help='Active to hide login module from menu.')

    group = parser.add_argument_group("NPM")
    group.add_argument('--npm_install', default=False, action='store_true',
                       help='Run NPM install at startup.')
    group.add_argument('--npm_build', default=False, action='store_true',
                       help='Run NPM build at startup.')
    group.add_argument('--npm_build_prod', default=False, action='store_true',
                       help='Run NPM build with prod client web.')
    group.add_argument('--npm_build_watch', default=False, action='store_true',
                       help='Run NPM build watch in threading. '
                            'Can be append with npm_build and it runs after the first build is completed.')

    group = parser.add_argument_group("Web client")
    group.add_argument('--web_environment_data_client', default=False, action='store_true',
                       help='Use data from client side by writing configuration in web environment, '
                            'instead of server data.')
    group.add_argument('--web_environment_prod', default=False, action='store_true',
                       help='Use production for development in Angular.')

    _parser = parser.parse_args()
    _parser.db_demo_path = DB_DEMO_PATH
    _parser.db_manual_path = DB_MANUAL_PATH
    _parser.db_character_form_path = DB_CHARACTER_FORM_PATH
    _parser.db_auth_keys_path = DB_AUTH_PATH
    _parser.db_google_API_path = GOOGLE_API_SECRET_PATH
    _parser.db_config_path = CONFIG_PATH
    _parser.db_package_NPM = PACKAGE_NPM
    _parser.db_angular_environment_path = ANGULAR_ENVIRONMENT_PATH
    _parser.db_angular_environment_prod_path = ANGULAR_ENVIRONMENT_PROD_PATH

    # Apply condition
    if not _parser.ssl and _parser.redirect_http_to_https:
        # Cannot redirect http to https if ssl is not enable
        _parser.redirect_http_to_https = False

    if _parser.disable_character:
        _parser.disable_user_character = True

    # Add general configuration in parser
    _parser.config = Config(_parser)

    return _parser


def parse_listen(string):
    tokens = string.split(':')
    listen = Listen()

    if len(tokens) == 1:
        listen.address = tokens[0]
    elif len(tokens) == 2:
        listen.address = tokens[0]
        listen.port = int(tokens[1])

    return listen


if __name__ == '__main__':
    main()
