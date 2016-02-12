#!/usr/bin/env python3
# -*- coding: utf-8 -*-

# Note: try except import with .(parent), because crash when reload the python.

import argparse
import os
import web

WEB_ROOT_DIR = os.path.dirname(os.path.realpath(__file__))
WEB_DEFAULT_STATIC_DIR = os.path.join(WEB_ROOT_DIR, 'static')
WEB_DEFAULT_TEMPLATE_DIR = os.path.join(WEB_ROOT_DIR, 'templates')


def main():
    args = parse_args()
    if args.debug:
        print("Arguments:%s" % args)
    web.main(args.debug, args.static_dir, args.template_dir, args.listen)


class Listen:
    address = "0.0.0.0"
    port = 8000

    def __repr__(self):
        return "'%s:%s'" % (self.address, self.port)


def parse_args():
    parser = argparse.ArgumentParser(description="web server")
    parser.add_argument('-l', '--web-listen-address', dest='listen',
                        default=Listen(), type=parse_listen,
                        help='Web: Web server listen address')
    parser.add_argument('-d', '--debug', dest='debug', default=False,
                        help='Enable debug', action='store_true')
    parser.add_argument('-s', '--static-dir', dest='static_dir',
                        default=WEB_DEFAULT_STATIC_DIR,
                        help='Web: Static files directory')
    parser.add_argument('-t', '--template-dir', dest='template_dir',
                        default=WEB_DEFAULT_TEMPLATE_DIR,
                        help='Web: Template files directory')
    return parser.parse_args()


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
