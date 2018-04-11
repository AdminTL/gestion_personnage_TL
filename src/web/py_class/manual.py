#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os


class Manual(object):
    """Contain all gaming rule."""

    def __init__(self, parser):
        self._str_manual = ""
        self._manual_path = parser.db_manual_path
        if os.path.isfile(self._manual_path):
            with open(self._manual_path, encoding='utf-8') as manual_file:
                self._str_manual = json.load(manual_file)
        else:
            self._str_manual = {"manual": []}

    def update(self, dct_manual, save=False):
        # Transform the object in json string
        self._str_manual = json.dumps(dct_manual)

        # Save on file
        if save:
            with open(self._manual_path, mode="w", encoding='utf-8') as manual_file:
                json.dump(dct_manual, manual_file, indent=2)

    def get_str_all(self):
        return self._str_manual
