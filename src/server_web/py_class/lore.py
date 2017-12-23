#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json


class Lore(object):
    """Contain knowledge who not necessary for the play."""

    def __init__(self, parser):
        self.str_lore = ""
        with open(parser.db_lore_path, encoding='utf-8') as lore_file:
            self.str_lore = json.load(lore_file)

    def get_str_all(self):
        return self.str_lore
