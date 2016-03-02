#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from enum import IntEnum


class UserPermission(IntEnum):
    player = 1
    admin = 2


class User:
    def __init__(self, dct):
        self._dct = dct

    def is_admin(self):
        return self._dct.get("perm") == UserPermission.admin

    def get(self, item):
        return self._dct.get(item)

    def __getitem__(self, item):
        return self._dct.get(item)
