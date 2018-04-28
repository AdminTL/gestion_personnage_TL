#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os


class CharRule(object):
    """Contain all gaming rule."""

    def __init__(self, parser):
        self._str_char_rule = ""
        self._char_rule_path = parser.db_char_rule_path
        if os.path.isfile(self._char_rule_path):
            with open(self._char_rule_path, encoding='utf-8') as char_rule_file:
                self._str_char_rule = json.load(char_rule_file)
        else:
            self._str_char_rule = {"char_rule": {}}

    def update(self, dct_char_rule, save=False):
        # Transform the object in json string
        # TODO validate manual
        self._str_char_rule = dct_char_rule

        # Save on file
        if save:
            with open(self._char_rule_path, mode="w", encoding='utf-8') as char_rule_file:
                json.dump(dct_char_rule, char_rule_file, indent=2)

    def get_str_all(self, is_admin=False):
        if not self._str_char_rule:
            return {}
        tmp_rule = {}
        if is_admin:
            tmp_rule["schema_user"] = self._str_char_rule["char_rule"]["schema_user"]
            tmp_rule["schema_char"] = self._str_char_rule["char_rule"]["schema_char"]
            tmp_rule["form_user"] = self._str_char_rule["char_rule"]["admin_form_user"]
            tmp_rule["form_char"] = self._str_char_rule["char_rule"]["admin_form_char"]
        else:
            tmp_rule["schema_user"] = self._str_char_rule["char_rule"]["schema_user"]
            tmp_rule["schema_char"] = self._str_char_rule["char_rule"]["schema_char"]
            tmp_rule["form_user"] = self._str_char_rule["char_rule"]["form_user"]
            tmp_rule["form_char"] = self._str_char_rule["char_rule"]["form_char"]
        return tmp_rule
