#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from sys import stderr


class AuthKeys(object):
    """Contains keys and secrets needed for third-party authentication."""

    def __init__(self, parser):
        self.keys = {}
        try:
            with open(parser.db_auth_keys_path, encoding='utf-8') as keys_file:
                self.keys = json.load(keys_file)
        except json.decoder.JSONDecodeError as exception:
            print("ERROR: %s isn't formatted properly. \nDetails: %s" % (parser.db_auth_keys_path, exception),
                  file=stderr)
        except FileNotFoundError:
            print("ERROR: file %s not exist. Please create it or read installation file." % parser.db_auth_keys_path)

    def get(self, key):
        result = self.keys.get(key)
        if result is None:
            print("WARNING: Key \"%s\" is not set. Some third-party authentications may not work properly." % key,
                  file=stderr)
        return result
