#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os


class Manual(object):
    """Contain all gaming rule."""

    def __init__(self, parser):
        # self._str_manual = ""
        self._manual = {}
        self._manual_path = parser.db_manual_path
        if os.path.isfile(self._manual_path):
            with open(self._manual_path, encoding='utf-8') as manual_file:
                self._manual = json.load(manual_file)
        else:
            self._manual = {"manual": [], "lore": [], "char_rule": {}, "point": {}, "skill_manual": {},
                            "system_point": [], "hability_point": {}}

    def update(self, dct_manual, save=False):
        # Transform the object in json string
        self._manual.update(dct_manual)
        # self._str_manual = json.dumps(self._manual)

        # Save on file
        if save:
            with open(self._manual_path, mode="w", encoding='utf-8') as manual_file:
                json.dump(self._manual, manual_file, indent=2)

    def get_all(self, is_admin=False):
        if not self._manual:
            return {}

        tmp_rule = {
            "char_rule": {},
            "manual": self._manual["manual"],
            "lore": self._manual["lore"],
            "point": self._manual["point"],
            "skill_manual": self._manual["skill_manual"],
            "hability_point": self._manual["hability_point"],
            "system_point": self._manual["system_point"],
        }
        if is_admin:
            tmp_rule["char_rule"]["form_user"] = self._manual["char_rule"]["admin_form_user"]
            tmp_rule["char_rule"]["form_char"] = self._manual["char_rule"]["admin_form_char"]
        else:
            tmp_rule["char_rule"]["form_user"] = self._manual["char_rule"]["form_user"]
            tmp_rule["char_rule"]["form_char"] = self._manual["char_rule"]["form_char"]

        tmp_rule["char_rule"]["schema_user"] = self._manual["char_rule"]["schema_user"]
        tmp_rule["char_rule"]["schema_char"] = self._manual["char_rule"]["schema_char"]
        tmp_rule["char_rule"]["schema_user_point"] = self._manual["char_rule"]["schema_user_point"]
        tmp_rule["char_rule"]["schema_char_point"] = self._manual["char_rule"]["schema_char_point"]

        return tmp_rule

    def get_str_all(self, is_admin=False):
        obj = self.get_all(is_admin=is_admin)
        return json.dumps(obj)

    def get_last_date_updated(self):
        if os.path.isfile(self._manual_path):
            f = os.path.getmtime(self._manual_path)
        else:
            f = 0
        return f

    @staticmethod
    def generate_link(manual):
        if "manual" not in manual.keys():
            manual["manual"] = []
        if "lore" not in manual.keys():
            manual["lore"] = []
        if "char_rule" not in manual.keys():
            # TODO remove char_rule, this is a complexity
            manual["char_rule"] = {
                "schema_user": {},
                "schema_char": {},
                "schema_user_point": {},
                "schema_char_point": {},
                "form_user": {},
                "form_char": {},
                "admin_form_user": {},
                "admin_form_char": {},
            }
        return manual
