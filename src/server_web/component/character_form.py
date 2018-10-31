#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json


class CharacterForm(object):
    """Contains the rules for dynamically generating the character form"""

    def __init__(self, parser):
        self._str_form = ""

        self._file_path = parser.db_character_form_path

        with open(self._file_path, encoding='utf-8') as a_file:
            self._str_form = json.load(a_file)

    def update(self, dct_form, save=False):
        # Transform the object in json string
        self._str_form = json.dumps(dct_form)

        # Save on file
        if save:
            with open(self._file_path, mode="w", encoding='utf-8') as file_file:
                json.dump(dct_form, file_file, indent=2)

    def get_str_all(self):
        return self._str_form
