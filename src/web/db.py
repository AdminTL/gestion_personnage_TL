#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
from tinydb import TinyDB, Query
import uuid
import user


class TLDB(object):
    def __init__(self, file=None):
        self._db = TinyDB(file)
        self._user = Query()

    def create_user(self, email, name, password):
        if self._db.contains(self._user.email == email):
            print("Cannot create user %s, already exist." % email, file=sys.stderr)
            return
        data = {"email": email, "name": name, "password": password, "uuid": uuid.uuid4().hex,
                "perm": user.UserPermission.player}
        eid = self._db.insert(data)
        return self._db.get(eid=eid)

    def get_user(self, email=None, password=None, _uuid=None):
        if email:
            _user = self._db.get(self._user.email == email)
        elif _uuid:
            if type(_uuid) is bytes:
                _uuid = _uuid.decode('UTF-8')
            _user = self._db.get(self._user.uuid == _uuid)
        else:
            # print("Missing uuid or email to get user.", file=sys.stderr)
            return

        if not _user:
            return

        # create obj
        _user = user.User(_user)
        # validate password
        if not password or _user.get("password") == password:
            return _user
