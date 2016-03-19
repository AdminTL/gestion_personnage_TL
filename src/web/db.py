#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import tinydb
import uuid
import user
import json


class DB(object):
    def __init__(self, parser):
        if parser.db_demo:
            self._db_user = tinydb.TinyDB(storage=tinydb.storages.MemoryStorage)
            # add demo data in fake database
            with open(parser.db_demo_path) as demo_user_file:
                demo_ddb_user = json.load(demo_user_file)
                for db_user in demo_ddb_user:
                    self._db_user.insert(db_user)
        else:
            file_path = parser.db_path
            self._db_user = tinydb.TinyDB(file_path)

        self._query_user = tinydb.Query()

    def create_user(self, email, name, password):
        if self._db_user.contains(self._query_user.email == email):
            print("Cannot create user %s, already exist." % email, file=sys.stderr)
            return
        data = {"email": email, "name": name, "password": password, "uuid": uuid.uuid4().hex,
                "perm": user.UserPermission.player}
        eid = self._db_user.insert(data)
        return self._db_user.get(eid=eid)

    def get_all_user(self):
        # get all user list
        return self._db_user.all()

    def get_user(self, email=None, password=None, _uuid=None):
        if email:
            _user = self._db_user.get(self._query_user.email == email)
        elif _uuid:
            if type(_uuid) is bytes:
                _uuid = _uuid.decode('UTF-8')
            _user = self._db_user.get(self._query_user.uuid == _uuid)
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

    def update_character(self, user_id, character_id, data):
        def _update_character():
            def transform(element):
                character = element.get("character", [])
                if character_id in character:
                    character[character_id] = data
                else:
                    print("Error, cannot find character_id %s for user_id %s" % (user_id, character_id))

            return transform

        self._db_user.update(_update_character(), self._query_user.nom == user_id)
