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

    def update_player(self, player_data, character_data=None, delete_player_id=None, delete_character_id=None):
        if not isinstance(player_data, dict):
            print("Cannot update player if player is not dictionary : %s" % player_data)
            return
        # if None, it's new user
        player_id = player_data.get("id")
        # if None, it's new character
        character_id = None if not isinstance(character_data, dict) else character_data.get("id")
        if character_id is None and delete_character_id:
            character_id = delete_character_id

        def _update_character():
            def transform(element):
                # element is never None, it's the actual player

                # update player information
                lst_ignore_player_field_update = ("character", "id")
                for key, value in player_data.items():
                    if key not in lst_ignore_player_field_update:
                        element[key] = value

                lst_character = element.get("character", [])
                # update character if find it, else create it

                i = 0
                for character in lst_character:
                    if character.get("id") == character_id:
                        # TODO validate fields in data
                        if delete_character_id:
                            del lst_character[i]
                        else:
                            lst_character[i] = character_data
                        break
                    i += 1
                else:
                    if character_data:
                        # it's a creation!
                        character_data["id"] = uuid.uuid4().hex
                        lst_character.append(character_data)

            return transform

        if delete_player_id:
            # 1. delete user
            self._db_user.remove(self._query_user.id == delete_player_id)
        elif not player_id:
            # 2. validate user exist, else create it. Ignore if delete action
            # TODO validate player_data field
            player_data["id"] = uuid.uuid4().hex
            self._db_user.insert(player_data)
        elif player_data or character_data or delete_character_id:
            # 3. validate character exist for update, else create it, or delete it.
            self._db_user.update(_update_character(), self._query_user.id == player_id)
