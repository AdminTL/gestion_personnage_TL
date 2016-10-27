#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# Note: try except import with .(parent), because crash when reload the python.

import argparse
import os
import web

WEB_ROOT_DIR = os.path.dirname(os.path.realpath(__file__))
WEB_DEFAULT_STATIC_DIR = os.path.join(WEB_ROOT_DIR)
WEB_DEFAULT_TEMPLATE_DIR = os.path.join(WEB_ROOT_DIR, 'partials')
DB_DEFAULT_PATH = os.path.join("..", "..", "database", "tl_user.json")
DB_DEMO_PATH = os.path.join("..", "..", "database", "demo_user.json")
DB_RULE_PATH = os.path.join("..", "..", "database", "tl_rule.json")


def main():
    args = parse_args()
    if args.debug:
        print("Arguments:%s" % args)
    web.main(args)


class Listen:
    # TODO don't hardcoded ip address to bind
    address = "127.0.0.1"
    port = 8000

    def __repr__(self):
        return "'%s:%s'" % (self.address, self.port)


def parse_args():
    parser = argparse.ArgumentParser(description="web server")

    group = parser.add_argument_group("Debug")
    group.add_argument('-d', '--debug', default=False, action='store_true',
                       help='Enable debug')
    group.add_argument('--open_browser', default=False, action='store_true',
                       help='Open web browser on tabulation when start server.')

    group = parser.add_argument_group("Config")
    group.add_argument('-s', '--static_dir', default=WEB_DEFAULT_STATIC_DIR,
                       help='Web: Static files directory')
    group.add_argument('-t', '--template_dir', default=WEB_DEFAULT_TEMPLATE_DIR,
                       help='Web: Template files directory')

    group = parser.add_argument_group("DataBase")
    group.add_argument('--db_path', default=DB_DEFAULT_PATH,
                       help='Specify a path for database file.')
    group.add_argument('--db_demo', default=False, action='store_true',
                       help='Active demo database. Cannot save information in real database, only keep in memory.')

    group = parser.add_argument_group("Web")
    group.add_argument('-l', '--web-listen-address', dest='listen', default=Listen(), type=parse_listen,
                       help='Web: Web server listen address')
    group.add_argument('--ssl', default=False, action='store_true',
                       help='Active https and create ssl files if not exist. Not work in windows.')
    group.add_argument('--use_internet_static', default=False, action='store_true',
                       help='Force use to use static files like css and js from another internet website.'
                            ' Use web browser cache.')

    group = parser.add_argument_group("Module")
    group.add_argument('--disable_character', default=False, action='store_true',
                       help='Active to disable character module.')
    group.add_argument('--disable_login', default=False, action='store_true',
                       help='Active to disable login module.')
    group.add_argument('--disable_admin', default=False, action='store_true',
                       help='Active to disable admin module.')

    _parser = parser.parse_args()
    _parser.db_demo_path = DB_DEMO_PATH
    _parser.db_rule_path = DB_RULE_PATH
    return _parser


def parse_listen(string):
    tokens = string.split(':')
    listen = Listen()

    if len(tokens) == 1:
        listen.address = tokens[0]
    elif len(tokens) == 2:
        listen.address = tokens[0]
        listen.port = tokens[1]

    return listen


if __name__ == '__main__':
    main()
