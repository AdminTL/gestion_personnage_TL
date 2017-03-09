#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json


class Manual(object):
    """Contain all gaming rule."""

    def __init__(self, parser):
        self.str_manual = ""
        with open(parser.db_manual_path, encoding='utf-8') as manual_file:
            self.str_manual = json.load(manual_file)

    def get_str_all(self):
        return self.str_manual
