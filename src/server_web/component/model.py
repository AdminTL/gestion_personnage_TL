#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os


class Model(object):
    """Contain all gaming rule."""

    def __init__(self, parser):
        # self._str_manual = ""
        if os.path.isfile(parser.db_model_path):
            self._model_path = parser.db_model_path
            print("INFO : use model database.")
        elif os.path.isfile(parser.db_model_demo_path):
            print("INFO : use demo model database.")
            self._model_path = parser.db_model_demo_path
        else:
            self._model_path = None
            print("INFO : empty model database.")

        if self._model_path:
            with open(self._model_path, encoding='utf-8') as model_file:
                self._model = json.load(model_file)
        else:
            print("Error, model is empty.")
            self._model = {
                "organization": {},
                "home": {},
                "manual": {"documents": []},
                "menu": {},
                "character": {},
            }

    def update(self, dct_model, save=False):
        # Transform the object in json string
        self._model.update(dct_model)

        # Save on file
        if save:
            with open(self._model_path, mode="w", encoding='utf-8') as model_file:
                json.dump(self._model, model_file, indent=2)

    def get_all(self, is_admin=False):
        if not self._model:
            return {}

        tmp_rule = {
            "char_rule": {},
            "manual": self._model["manual"],
            "lore": self._model["lore"],
            "point": self._model["point"],
            "skill_manual": self._model["skill_manual"]
        }
        if is_admin:
            tmp_rule["char_rule"]["schema_user"] = self._model["char_rule"]["schema_user"]
            tmp_rule["char_rule"]["schema_char"] = self._model["char_rule"]["schema_char"]
            tmp_rule["char_rule"]["form_user"] = self._model["char_rule"]["admin_form_user"]
            tmp_rule["char_rule"]["form_char"] = self._model["char_rule"]["admin_form_char"]
        else:
            tmp_rule["char_rule"]["schema_user"] = self._model["char_rule"]["schema_user"]
            tmp_rule["char_rule"]["schema_char"] = self._model["char_rule"]["schema_char"]
            tmp_rule["char_rule"]["form_user"] = self._model["char_rule"]["form_user"]
            tmp_rule["char_rule"]["form_char"] = self._model["char_rule"]["form_char"]

        return tmp_rule

    def get_str_all(self, is_admin=False):
        # obj = self.get_all(is_admin=is_admin)
        obj = self._model
        return json.dumps(obj)

    def get_str(self, name):
        obj = self._model.get(name, {})
        return json.dumps(obj)

    def get_last_date_updated(self):
        if os.path.isfile(self._model_path):
            f = os.path.getmtime(self._model_path)
        else:
            f = 0
        return f
