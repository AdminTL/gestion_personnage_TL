#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import tinydb
import uuid
import base64
from py_class import user
import hashlib
import os
import json
import datetime


class DB(object):
    def __init__(self, parser):
        if parser.db_demo:
            self._db_user = tinydb.TinyDB(storage=tinydb.storages.MemoryStorage)
            # add demo data in fake database
            with open(parser.db_demo_path, encoding='utf-8') as demo_user_file:
                demo_ddb_user = json.load(demo_user_file)
                for db_user in demo_ddb_user:
                    self._db_user.insert(db_user)
        else:
            file_path = parser.db_path
            self._db_user = tinydb.TinyDB(file_path)

        self._query_user = tinydb.Query()

    def create_user(self, name, email, password):
        if self._db_user.contains(self._query_user.email == email):
            print("Cannot create user %s, already exist." % email, file=sys.stderr)
            return
        if self._db_user.contains(self._query_user.name == name):
            print("Cannot create user %s, already exist." % name, file=sys.stderr)
            return
        
        # Check to avoid rare possible UUID collisions
        user_id = uuid.uuid4().hex
        while self._db_user.contains(self._query_user.email == email):
            user_id = uuid.uuid4().hex

        salt = base64.b64encode(os.urandom(48)).decode('UTF-8')
        secure_pass = hashlib.sha256((salt+password).encode('UTF-8')).hexdigest()
        
        data = {"email": email, "name": name, "salt": salt, "password": secure_pass,
                "user_id": user_id, "permission": "Joueur"}
        eid = self._db_user.insert(data)
        return self._db_user.get(eid=eid)

    def get_all_user(self, user_id=None):
        if not user_id:
            # get all user list
            return self._db_user.all()
        return self._db_user.search(self._query_user.user_id == user_id)

    def get_user(self, email=None, password=None, user_id=None):
        # Lookup the user by it's email
        if email:
            _user = self._db_user.get(self._query_user.email == email)
            # Validate password
            salt = _user.get("salt")
            secure_pass = hashlib.sha256((salt+password).encode('UTF-8')).hexdigest()
            if not password or _user.get("password") == secure_pass:
                return _user
            
        # If no email provided, lookup user by id
        elif user_id:
            if type(user_id) is bytes:
                user_id = user_id.decode('UTF-8')
            _user = self._db_user.get(self._query_user.user_id == user_id)
            return _user 

        else:
            print("Missing user email, id or name to get user.", file=sys.stderr)
            return

        if not _user:
            return

    def user_exists(self, email=None, user_id=None, name=None):
        return(not(email and not self._db_user.get(self._query_user.email == email)) and
               not(user_id and not self._db_user.get(self._query_user.user_id == user_id)) and
               not(name and not self._db_user.get(self._query_user.name == name))
               )
        
    
    def update_user(self, user_data, character_data=None, delete_user_by_id=None, delete_character_by_id=None):
        if not isinstance(user_data, dict):
            print("Cannot update user if user is not dictionary : %s" % user_data)
            return
        d = datetime.datetime.utcnow().timestamp()
        # if None, it's new user
        user_id = user_data.get("user_id")
        # if None, it's new character
        character_id = None if not isinstance(character_data, dict) else character_data.get("user_id")
        if character_id is None and delete_character_by_id:
            character_id = delete_character_by_id

        def _update_character():
            def transform(element):
                # element is never None, it's the actual user

                # update user information
                lst_ignore_user_field_update = ("character", "character_id")
                for key, value in user_data.items():
                    if key not in lst_ignore_user_field_update:
                        element[key] = value

                lst_character = element.get("character", [])
                # update character if find it, else create it

                i = 0
                for character in lst_character:
                    if character.get("character_id") == character_id:
                        # TODO validate fields in data
                        if delete_character_by_id:
                            del lst_character[i]
                        else:
                            lst_character[i] = character_data
                            # update last modify date
                            character_data["date_modify"] = datetime.datetime.utcnow().timestamp()
                        break
                    i += 1
                else:
                    if character_data:
                        # it's a creation!
                        character_data["character_id"] = uuid.uuid4().hex
                        character_data["date_modify"] = character_data["date_creation"] = d
                        lst_character.append(character_data)

            return transform

        if delete_user_by_id:
            # 1. delete user
            self._db_user.remove(self._query_user.user_id == delete_user_by_id)
        elif not user_id:
            # 2. validate user exist, else create it. Ignore if delete action
            # TODO validate user_data field
            user_data["user_id"] = uuid.uuid4().hex
            user_data["character"] = [character_data] if character_data else []
            user_data["date_modify"] = user_data["date_creation"] = d
            self._db_user.insert(user_data)
        elif user_data or character_data or delete_character_by_id:
            # 3. validate character exist for update, else create it, or delete it.
            user_data["date_modify"] = d
            self._db_user.update(_update_character(), self._query_user.character_id == character_id)
