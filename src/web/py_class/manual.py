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

    def get_all(self, is_admin=False, disable_record=False):
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
            lst_form_user = self._manual["char_rule"]["admin_form_user"]
            lst_form_char = self._manual["char_rule"]["admin_form_char"]
        else:
            lst_form_user = self._manual["char_rule"]["form_user"]
            lst_form_char = self._manual["char_rule"]["form_char"]
        if disable_record:
            lst_form_user = lst_form_user[:]
            lst_form_char = lst_form_char[:]
            lst_index = []
            i = 0
            for info in lst_form_user:
                if info.get("type") == "submit":
                    lst_index.append(i)
                i += 1
            for index in lst_index[::-1]:
                lst_form_user.pop(index)
            lst_index = []
            i = 0
            for info in lst_form_char:
                if info.get("type") == "submit":
                    lst_index.append(i)
                i += 1
            for index in lst_index[::-1]:
                lst_form_char.pop(index)
        tmp_rule["char_rule"]["form_user"] = lst_form_user
        tmp_rule["char_rule"]["form_char"] = lst_form_char

        tmp_rule["char_rule"]["schema_user"] = self._manual["char_rule"]["schema_user"]
        tmp_rule["char_rule"]["schema_char"] = self._manual["char_rule"]["schema_char"]
        tmp_rule["char_rule"]["schema_user_point"] = self._manual["char_rule"]["schema_user_point"]
        tmp_rule["char_rule"]["schema_char_point"] = self._manual["char_rule"]["schema_char_point"]
        tmp_rule["char_rule"]["schema_user_print"] = self._manual["char_rule"]["schema_user_print"]
        tmp_rule["char_rule"]["schema_char_print"] = self._manual["char_rule"]["schema_char_print"]

        return tmp_rule

    def get_str_all(self, is_admin=False, disable_record=False):
        obj = self.get_all(is_admin=is_admin, disable_record=disable_record)
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
                "schema_user_print": {},
                "schema_char_print": {},
                "form_user": {},
                "form_char": {},
                "admin_form_user": {},
                "admin_form_char": {},
            }
        return manual
