#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json


class Rule(object):
    """Contain all gaming rule."""
    def __init__(self, parser):
        self.str_rule = ""
        with open(parser.db_rule_path) as rule_file:
            self.str_rule = json.load(rule_file)

    def get_rule(self):
        return self.str_rule
