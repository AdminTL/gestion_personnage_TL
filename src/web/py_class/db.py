#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import tinydb
import uuid
import json
import datetime
import bcrypt
import glob
import os
import time
import humanize
import shutil
import io
import zipfile


class DB(object):
    def __init__(self, parser):
        self.init(parser)

    def init(self, parser):
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

    def close(self):
        self._db_user.close()

    @staticmethod
    def generate_password(password):
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    @staticmethod
    def compare_password(user_password, hash_password):
        if not user_password or not hash_password:
            return False
        return bcrypt.checkpw(user_password.encode('utf-8'), hash_password.encode('utf-8'))

    def create_user(self, username, email=None, password=None, google_id=None, facebook_id=None, twitter_id=None,
                    name=None, permission="Joueur", given_name=None, family_name=None, verified_email=False,
                    locale=None, postal_code=None):

        # Validate no duplicate user
        if self._db_user.contains(self._query_user.username == username):
            print("Cannot create user %s, already exist." % username, file=sys.stderr)
            return
        if self._db_user.contains(self._query_user.email == email):
            print("Cannot create user %s, already exist." % email, file=sys.stderr)
            return

        # Check to avoid rare possible UUID collisions
        user_id = uuid.uuid4().hex
        while self._db_user.contains(self._query_user.user_id == user_id):
            user_id = uuid.uuid4().hex

        secure_pass = self.generate_password(password) if password else None

        # TODO let user create it and not automatic create
        empty_character = [{
        }]

        # Special case, if only empty user, force permission to Admin
        if len(self._db_user.all()) == 0:
            permission = "Admin"

        data = {"email": email, "username": username, "name": name, "given_name": given_name,
                "family_name": family_name, "password": secure_pass, "user_id": user_id, "google_id": google_id,
                "facebook_id": facebook_id, "twitter_id": twitter_id, "permission": permission,
                "verified_email": verified_email, "locale": locale, "postal_code": postal_code,
                "character": empty_character}

        eid = self._db_user.insert(data)
        return self._db_user.get(eid=eid)

    def add_missing_info_user(self, obj_user, password=None, google_id=None, facebook_id=None, twitter_id=None,
                              name=None, given_name=None, family_name=None, verified_email=False, locale=None,
                              postal_code=None, force=False):
        has_update = False

        if password and (not obj_user.get("password") or force):
            obj_user["password"] = password
            has_update = True

        if google_id and not obj_user.get("google_id"):
            obj_user["google_id"] = google_id
            has_update = True

        if facebook_id and not obj_user.get("facebook_id"):
            obj_user["facebook_id"] = facebook_id
            has_update = True

        if twitter_id and not obj_user.get("twitter_id"):
            obj_user["twitter_id"] = twitter_id
            has_update = True

        if name and not obj_user.get("name"):
            obj_user["name"] = name
            has_update = True

        if given_name and not obj_user.get("given_name"):
            obj_user["given_name"] = given_name
            has_update = True

        if family_name and not obj_user.get("family_name"):
            obj_user["family_name"] = family_name
            has_update = True

        if verified_email and not obj_user.get("verified_email"):
            obj_user["verified_email"] = verified_email
            has_update = True

        if locale and not obj_user.get("locale"):
            obj_user["locale"] = locale
            has_update = True

        if postal_code and not obj_user.get("postal_code"):
            obj_user["postal_code"] = postal_code
            has_update = True

        if has_update:
            self.update_user(obj_user)

    @staticmethod
    def list_databases(specific_filename=None):
        new_lst = []
        actual_db = None
        lst_tl_user = glob.glob(os.path.join("..", "..", "database", "*tl_user*.json"))
        for tl_user in lst_tl_user:
            filename = os.path.basename(tl_user)
            if specific_filename and specific_filename != filename:
                continue
            dct_value = {
                "file_path": tl_user,
                "file_name": filename,
                "date_last_modified": os.path.getmtime(tl_user),
                "date_last_modified_str": time.ctime(os.path.getmtime(tl_user)),
                "size": os.path.getsize(tl_user),
                "human_size": humanize.naturalsize(os.path.getsize(tl_user)),
            }
            if filename == "tl_user.json":
                actual_db = dct_value
            else:
                new_lst.append(dct_value)
        sorted_list = sorted(new_lst, key=lambda obj: obj.get("file_name"), reverse=True)
        if actual_db:
            sorted_list.insert(0, actual_db)
        return sorted_list

    @staticmethod
    def backup_database(label=None):
        now = datetime.datetime.now()
        prefix_date = now.strftime("%Y_%m_%d-%H_%M_%S")
        if label:
            label = label.replace(".", "").replace("/", "").replace("\\", "")
            filename = f"{prefix_date}_{label}_tl_user.json"
        else:
            filename = f"{prefix_date}_tl_user.json"
        actual_file_path = os.path.join("..", "..", "database", "tl_user.json")
        new_file_path = os.path.join("..", "..", "database", filename)
        try:
            shutil.copyfile(actual_file_path, new_file_path)
        except Exception as e:
            print(f"Error occur in backup_database: {e}")
        return filename

    @staticmethod
    def get_database_bytes(name):
        actual_file_path = os.path.join("..", "..", "database", name)
        if not os.path.isfile(actual_file_path):
            return None
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as zip_mem:
            with open(actual_file_path, 'rb') as fh:
                zip_mem.writestr(name, fh.read())
        return buffer.getvalue()

    def get_all_user(self, user_id=None, with_password=False):
        if not user_id:
            # get all user list
            lst_user = self._db_user.all()
        else:
            lst_user = self._db_user.search(self._query_user.user_id == user_id)
        if not with_password:
            for user_obj in lst_user:
                if "password" in user_obj:
                    del user_obj["password"]
        return lst_user

    def get_all_user_admin(self, ignore_user_id=None):
        if ignore_user_id:
            return self._db_user.search(
                self._query_user.permission == "Admin" and self._query_user.user_id != ignore_user_id)
        return self._db_user.search(self._query_user.permission == "Admin")

    def get_user(self, username=None, email=None, password=None, id_type="user", user_id=None,
                 force_email_no_password=False):
        # Lookup the user by it's name
        if username:
            _user = self._db_user.get(self._query_user.username == username)
            if _user:
                # Validate password
                ddb_password = _user.get("password")
                if password and ddb_password and self.compare_password(password, ddb_password):
                    return _user

        # If no username provided, lookup user by email
        if email:
            _user = self._db_user.get(self._query_user.email == email)
            if _user:
                if not force_email_no_password:
                    # Validate password
                    ddb_password = _user.get("password")
                    if password and ddb_password and self.compare_password(password, ddb_password):
                        return _user
                else:
                    return _user

        # If no username or email provided, lookup user by id
        if user_id:
            if type(user_id) is bytes:
                user_id = user_id.decode('UTF-8')

            if id_type == "user":
                query = self._query_user.user_id
            elif id_type == "google":
                query = self._query_user.google_id
            elif id_type == "facebook":
                query = self._query_user.facebook_id
            elif id_type == "twitter":
                query = self._query_user.twitter_id
            else:
                # print("Invalid ID type: " + str(id_type), file=sys.stderr)
                return

            _user = self._db_user.get(query == user_id)
            return _user
        else:
            # print("Missing user username, email or id to get user.", file=sys.stderr)
            return

    def user_exist(self, email=None, user_id=None, username=None):
        """Returns True if all the arguments given are found"""
        return not (email and not self._db_user.get(self._query_user.email == email)) and not (
                user_id and not self._db_user.get(self._query_user.user_id == user_id)) and not (
                username and not self._db_user.get(self._query_user.username == username))

    def update_user(self, user_data, character_data=None, delete_user_by_id=None, delete_character_by_id=None,
                    cancel_update_date=False, updated_by_admin=False):
        if not isinstance(user_data, dict):
            print("Cannot update user if user is not dictionary : %s" % user_data)
            return
        actual_date = datetime.datetime.now(datetime.timezone.utc).timestamp()
        # if None, it's new user
        user_id = user_data.get("user_id")
        # if None, it's new character
        character_id = None if not isinstance(character_data, dict) else character_data.get("character_id")
        if character_id is None and delete_character_by_id:
            character_id = delete_character_by_id

        def _update_character():
            def transform(element):
                # element is never None, it's the actual user

                # update user information
                lst_ignore_user_field_update = ("character", "user_id")
                for key, value in user_data.items():
                    if key not in lst_ignore_user_field_update:
                        element[key] = value

                if "character" not in element:
                    element["character"] = []

                lst_character = element.get("character", [])
                # update character if find it, else create it

                i = 0
                for character in lst_character:
                    if character.get("character_id") == character_id:
                        # TODO validate fields in data
                        if delete_character_by_id:
                            del lst_character[i]
                        elif character_data:
                            lst_character[i] = character_data
                            # update last modify date
                            if not cancel_update_date:
                                character_data["date_modify"] = actual_date
                            if "date_creation" not in character_data and "date_modify" in character_data:
                                character_data["date_creation"] = character_data["date_modify"]
                        break
                    i += 1
                else:
                    if character_data:
                        # it's a creation!
                        character_data["character_id"] = uuid.uuid4().hex
                        character_data["date_modify"] = character_data["date_creation"] = actual_date
                        lst_character.append(character_data)

            return transform

        if delete_user_by_id:
            # 1. delete user
            self._db_user.remove(self._query_user.user_id == delete_user_by_id)
        elif not user_id:
            # 2. validate user exist, else create it. Ignore if delete action
            # TODO validate user_data field
            user_data["user_id"] = uuid.uuid4().hex
            if character_data:
                character_data["date_creation"] = actual_date
                character_data["date_modify"] = actual_date
            user_data["character"] = [character_data] if character_data else []
            user_data["date_modify"] = user_data["date_creation"] = actual_date
            self._db_user.insert(user_data)
        elif user_data or character_data or delete_character_by_id:
            if not cancel_update_date:
                if character_data and "approbation" in character_data:
                    # When approved and update the character, it's unapproved
                    approbation = character_data.get("approbation")
                    # Only approved or "to correct" become unapproved
                    # When an admin save, it become automatic approved
                    if updated_by_admin:
                        character_data["approbation"] = {"status": 1, "date": actual_date}
                    elif approbation.get("status") in [1, 4]:
                        character_data["approbation"] = {"status": 2, "date": actual_date}

                # 3. validate character exist for update, else create it, or delete it.
                user_data["date_modify"] = actual_date
            self._db_user.update(_update_character(), self._query_user.user_id == user_id)

    def stat_get_total_season_pass(self):
        # self._db_user.search(tinydb.Query().character.all(tinydb.Query().xp_gn_1_2016 == True))
        # Cannot work if change '== True' for 'is True'
        return {"total_season_pass_2018": len(self._db_user.search(self._query_user.passe_saison_2018 == True))}

    def get_character(self, user_id, character_name):
        user = self.get_user(user_id=user_id)
        if not user:
            return
        for char in user.get("character"):
            if char.get("name") == character_name:
                return char

    def set_approbation(self, user_id, character_name, approbation_status):
        user = self.get_user(user_id=user_id)
        actual_date = datetime.datetime.now(datetime.timezone.utc).timestamp()
        approbation = {"status": approbation_status, "date": actual_date}
        for char in user.get("character"):
            if char.get("name") == character_name:
                char["approbation"] = approbation
                break

        self.update_user(user, character_data=char, cancel_update_date=True)
        return {"status": "Success", "data": approbation}
