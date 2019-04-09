#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from sys import stderr
import base64
import uuid


class AuthKeys(object):
    """Contains keys and secrets needed for third-party authentication."""

    def __init__(self, parser, auto_gen_secret=False):
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

        if auto_gen_secret:
            key = "cookie_secret"
            if key not in self.keys:
                print("WARNING: Regenerate key \"%s\"." % key)
                bytes_result = base64.b64encode(uuid.uuid4().bytes + uuid.uuid4().bytes)
                result = bytes_result.decode('utf-8')
                self.keys[key] = result
                # Save generated key
                self._flush()

    def get(self, key, default=""):
        result = self.keys.get(key, default)
        if not result:
            print("WARNING: Key \"%s\" is not set. Some third-party authentications may not work properly." % key,
                  file=stderr)
        return result

    def get_social_auth_config(self):
        """
        Get boolean if social auth is enabled for each different component
        :return: dictionary with boolean activation
        """
        # TODO check if the auth works to enable it for users

        if "google_oauth" in self.keys:
            obj = self.keys["google_oauth"]
            use_google_auth = bool(obj.get("key") and obj.get("secret"))
        else:
            use_google_auth = False

        use_facebook_auth = bool(self.keys.get("facebook_api_key") and self.keys.get("facebook_secret"))

        social_auth_config = {
            "enableSocialAuth": use_google_auth or use_facebook_auth,
            "enableGoogleAuth": use_google_auth,
            "enableFacebookAuth": use_facebook_auth,
        }
        return social_auth_config

    def _flush(self):
        with open(self._db_auth_keys_path, mode='w', encoding='utf-8') as keys_file:
            json.dump(self.keys, keys_file)
