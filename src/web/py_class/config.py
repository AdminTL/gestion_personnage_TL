#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from sys import stderr


class Config(object):
    """Contains general configuration."""

    def __init__(self, parser):
        self._db_config_path = parser.db_config_path
        self._keys = {}
        try:
            with open(self._db_config_path, encoding='utf-8') as keys_file:
                self._keys = json.load(keys_file)
        except json.decoder.JSONDecodeError as exception:
            print("ERROR: %s isn't formatted properly. \nDetails: %s" % (self._db_config_path, exception),
                  file=stderr)
        except FileNotFoundError:
            print("ERROR: file %s not exist. Please create it or read installation file." % self._db_config_path)

    def get(self, key, default=None):
        """
        Get the value of the key.

        Use dot to generate a key to navigate in the dictionary.
        Example: test1.test2.test3

        :return: Return the value or None if cannot find the key.
        """
        lst_key = key.split(".")
        first_run = True
        result = default
        for a_key in lst_key:
            if first_run:
                result = self._keys.get(a_key)
                first_run = False
            elif type(result) is not dict:
                print("Error to get key %s in file %s" % (key, self._db_config_path), file=stderr)
                return
            else:
                result = result.get(a_key)

        if result is None:
            result = default

        return result

    def update(self, key, value, save=False):
        """
        Update set of key with value.
        :param key: string of value separate by dot
        :param value: The value to insert.
        :param save: Option to save on file
        :return:
        """
        # Search and replace value for key
        lst_key = key.split(".")
        result = None
        for i in range(len(lst_key)):
            a_key = lst_key[i]
            if i == 0:
                if a_key in self._keys:
                    result = self._keys.get(a_key)
                else:
                    result = {}
                    self._keys[a_key] = result
            elif type(result) is not dict:
                print("Error to get key %s in file %s" % (key, self._db_config_path), file=stderr)
                return
            elif i == len(lst_key) - 1:
                result[a_key] = value
            else:
                result = result.get(a_key)

        # Save on file
        if save:
            with open(self._db_config_path, mode="w", encoding='utf-8') as txt_file:
                json.dump(self._keys, txt_file, indent=2)
