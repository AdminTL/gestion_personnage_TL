#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from sys import stderr
import base64
import uuid


class AuthKeys(object):
    """Contains keys and secrets needed for third-party authentication."""

    def __init__(self, parser):
        self._db_auth_keys_path = parser.db_auth_keys_path
        self.keys = {}
        try:
            with open(self._db_auth_keys_path, encoding='utf-8') as keys_file:
                self.keys = json.load(keys_file)
        except json.decoder.JSONDecodeError as exception:
            print("ERROR: %s isn't formatted properly. \nDetails: %s" % (parser.db_auth_keys_path, exception),
                  file=stderr)
        except FileNotFoundError:
            print("ERROR: file %s not exist. Please create it or read installation file." % parser.db_auth_keys_path)

    def get(self, key, auto_gen=False):
        result = self.keys.get(key)
        if not result:
            if not auto_gen:
                print("WARNING: Key \"%s\" is not set. Some third-party authentications may not work properly." % key,
                      file=stderr)
            else:
                print("WARNING: Regenerate key \"%s\"." % key)
                bytes_result = base64.b64encode(uuid.uuid4().bytes + uuid.uuid4().bytes)
                result = bytes_result.decode('utf-8')
                self.keys[key] = result
                self._flush()
        return result

    def _flush(self):
        with open(self._db_auth_keys_path, mode='w', encoding='utf-8') as keys_file:
            json.dump(self.keys, keys_file)
