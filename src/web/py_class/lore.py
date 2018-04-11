#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os


class Lore(object):
    """Contain knowledge who not necessary for the play."""

    def __init__(self, parser):
        self._str_lore = ""
        self._lore_path = parser.db_lore_path
        if os.path.isfile(self._lore_path):
            with open(self._lore_path, encoding='utf-8') as lore_file:
                self._str_lore = json.load(lore_file)
        else:
            self._str_manual = {"lore": []}

    def update(self, dct_lore, save=False):
        # Transform the object in json string
        self._str_lore = json.dumps(dct_lore)

        # Save on file
        if save:
            with open(self._lore_path, mode="w", encoding='utf-8') as lore_file:
                json.dump(dct_lore, lore_file, indent=2)

    def get_str_all(self):
        return self._str_lore
