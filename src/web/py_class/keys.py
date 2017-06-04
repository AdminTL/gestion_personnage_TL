#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from sys import stderr


class Keys(object):
    """Contains keys and secrets needed for third-party authentication."""

    def __init__(self, parser):
        self.keys = {}
        try:
            with open(parser.db_keys_path, encoding='utf-8') as keys_file:
                self.keys = json.load(keys_file)
        except json.decoder.JSONDecodeError as exception:
            print("ERROR: %s isn't formatted properly. \nDetails: %s" % (parser.db_keys_path, exception), file=stderr)
        except FileNotFoundError as exception:
            print("WARNING: %s\nA file has been created for you." % exception)
            with open(parser.db_keys_path, "w", encoding='utf-8') as keys_file:
                keys_file.write("{\n" +
                                "  \"example_key\": \"this is a key\",\n" +
                                "  \"example_secret\": \"this is a secret key\"\n" +
                                "}")

    def get(self, key):
        result = self.keys.get(key)
        if result is None:
            print("WARNING: Key \"%s\" is not set. Some third-party authentications may not work properly." % key,
                  file=stderr)
        return result
