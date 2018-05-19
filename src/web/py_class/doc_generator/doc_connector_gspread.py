#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
import gspread
from enum import Enum


class DocType(Enum):
    """
    Enumerator to support external documentation from Google Spread Sheet.
    Contain static information about different type of documentation.
    """
    # To generate documentation
    DOC = 0
    # To create form on client
    FORM = 1
    # To generate database model
    SCHEMA = 2

    # To manage event
    # EVENT = 3

    def get_header(self):
        """
        List of header per type of document.
        :return: list of string with header of sheet.
        """
        if self.value == self.DOC.value:
            header = [
                "Level", "Admin", "Key", "Title", "Description", "Bullet Description", "Second Bullet Description",
                "Under Level Color", "Sub Key", "Model", "Point", "HidePlayer"
            ]
        elif self.value == self.FORM.value:
            header = [
                "Level", "Admin", "Key", "Placeholder", "Type", "Options", "Value", "Name", "Category", "Add", "Style",
                "Model", "ReadByPlayer", "ReadOnlyPlayer"
            ]
        elif self.value == self.SCHEMA.value:
            header = [
                "Level", "Name", "Type", "Title", "minLength", "pattern", "required", "minItems", "maxItems",
                "uniqueItems", "Description"
            ]
        else:
            header = []
        return header

    def get_cb_parser(self, doc_connector_gspread):
        """
        Search good callback to parse the sheet.
        :param doc_connector_gspread: object of DocConnectorGSpread
        :return: cb of method to parse the sheet.
        """
        if not isinstance(doc_connector_gspread, DocConnectorGSpread):
            return None

        if self.value == self.DOC.value:
            cb = doc_connector_gspread._parse_sheet_type_doc
        elif self.value == self.FORM.value:
            cb = doc_connector_gspread._parse_sheet_type_form
        elif self.value == self.SCHEMA.value:
            cb = doc_connector_gspread._parse_sheet_type_schema
        else:
            cb = None
        return cb


class DocConnectorGSpread:
    """
    DocConnectorGSpread manage doc generation parsing and Google spreadsheet functionality.

    Use DocGeneratorGSpread to get instance of DocGeneratorGSpread.
    This is more secure for multi-thread execution.
    """

    def __init__(self, gc, gc_doc, msg_share_invite):
        self._gc = gc
        self._g_file = gc_doc

        self._generated_doc = None
        self._error = None
        self._connector_is_valid = True
        self._msg_share_invite = msg_share_invite
        self._doc_point = {}
        self._doc_manual_skill = {}

        self._info_sheet = [
            {"type": DocType.DOC, "name": "manual", "permission": ["anyone"]},
            {"type": DocType.DOC, "name": "manual", "permission": ["admin"], "is_admin": True},
            {"type": DocType.DOC, "name": "lore", "permission": ["anyone"]},
            {"type": DocType.DOC, "name": "lore", "permission": ["admin"], "is_admin": True},
            {"type": DocType.SCHEMA, "name": "schema_user", "permission": ["user"]},
            {"type": DocType.SCHEMA, "name": "schema_char", "permission": ["user"]},
            {"type": DocType.FORM, "name": "form_user", "permission": ["user"], "is_admin": False},
            {"type": DocType.FORM, "name": "form_char", "permission": ["user"], "is_admin": False},
            {"type": DocType.FORM, "name": "form_user", "permission": ["admin"], "is_admin": True},
            {"type": DocType.FORM, "name": "form_char", "permission": ["admin"], "is_admin": True},
        ]

    def has_error(self):
        """

        :return: If instance of _DocGenerator contain error.
        """
        return bool(self._error)

    def get_error(self, create_object=True, force_error=False):
        """

        :param create_object: if return dict with key "error" or return the message in string
        :param force_error: if activate, generate an unknown error message.
        :return: information about error.
        """
        msg = self._error
        if not msg and force_error:
            msg = "Unknown error."

        if create_object:
            return {"error": msg}
        return msg

    def is_auth_valid(self):
        """

        :return: True if authentication is valid, else need to create a new instance of the document
        """
        return self._connector_is_valid

    def get_permission_document(self):
        """
        Get permission of all user.
        :return: Formatted list of user with permission
        """
        if not self._g_file:
            return False

        all_info = self._g_file.list_permissions()
        lst_info = []
        for perm in all_info:
            info = {"name": perm.get('name'), "email": perm.get("emailAddress"), "role": perm.get("role"),
                    "type": perm.get("type")}
            lst_info.append(info)
        return lst_info

    def get_generated_doc(self):
        """
        Property of generated_doc
        :return: return False if the document is not generated, else return the dict
        """
        if self._generated_doc:
            return self._generated_doc
        return False

    def check_has_permission(self):
        """
        Return bool if success or fail. Return dict when got error.
        :return:
        """
        # To know if permission error, get worksheets
        try:
            self._g_file.worksheets()
        except gspread.v4.exceptions.APIError as e:
            if e.response.status_code == 403:
                return False
            if e.response.status_code == 401:
                self._connector_is_valid = False
                # Need to reopen the file and ask user to refresh
                self._error = "Refresh the page. Got error %s" % e
                print(self._error, file=sys.stderr)
                return False

            self._error = "Got error %s" % e
            print(self._error, file=sys.stderr)
            return False
        return True

    def has_user_write_permission(self, email):
        """
        Check if the user from email has writing permission on the document.
        :param email: email in string
        :return: success or fail
        """
        if not self._g_file:
            return False

        has_permission = self.check_has_permission()
        if type(has_permission) is dict or not has_permission:
            return False

        lst_permission = self._g_file.list_permissions()
        for perm in lst_permission:
            if perm.get("emailAddress") == email and perm.get("role") in ["owner", "writer"]:
                return True
        return False

    def share_document(self, email):
        """
        Share a document and send email for invitation.
        :param email: email of user.
        :return: succeed or failed
        """
        if not self._g_file:
            return False

        msg = self._msg_share_invite
        self._g_file.share(email, "user", "writer", notify=True, email_message=msg)
        return True

    def generate_doc(self):
        """
        Generate documentation.
        :return: True when success, else False
        """
        if not self._g_file:
            self._error = "Remote file is not open."
            print(self._error, file=sys.stderr)
            return False

        # Create spreadsheet variable
        sh = self._g_file
        worksheet_list = sh.worksheets()
        dct_doc = {}
        self._doc_point = {}
        self._doc_manual_skill = {}

        for sheet_info in self._info_sheet:
            sheet_name = sheet_info.get("name")
            sheet_type = sheet_info.get("type")

            # Validate sheet_type
            if sheet_type not in list(DocType):
                self._error = "Internal error, not supported definition of type %s" % sheet_type
                print(self._error, file=sys.stderr)
                return False

            # Find working sheet
            for sheet in worksheet_list:
                if sheet.title == sheet_name:
                    manual_sheet = sheet
                    break
            else:
                lst_str_worksheet = [sheet.title for sheet in worksheet_list]
                self._error = "Sheet '%s' not exist. Existing sheet: %s" % (sheet_name, lst_str_worksheet)
                print(self._error, file=sys.stderr)
                return False

            # Validate the header
            header_row = manual_sheet.row_values(1)
            if sheet_type.get_header() != header_row:
                self._error = "Header of sheet %s is %s, and expected is %s" % (
                    sheet_name, header_row, sheet_type.get_header())
                print(self._error, file=sys.stderr)
                return False

            # Fetch all line
            all_values = manual_sheet.get_all_values()

            # Parse sheet
            cb = sheet_type.get_cb_parser(self)
            if cb:
                info = cb(sheet_info, sheet_name, all_values)
            else:
                self._error = "Internal error, cannot find method to parse the sheet with type %s." % sheet_type
                print(self._error, file=sys.stderr)
                return False

            if info is None:
                # Error in parsing
                return False

            # Compilation of unique result
            is_form_admin = sheet_info.get("is_admin", False)
            adapted_sheet_name = sheet_name if not is_form_admin else "admin_" + sheet_name
            dct_doc[adapted_sheet_name] = info

        # Add extra compilation about point page
        dct_doc["point"] = self._doc_point
        dct_doc["skill_manual"] = self._doc_manual_skill

        self._generated_doc = dct_doc
        return True

    def _parse_sheet_type_schema(self, sheet_info, doc_sheet_name, all_values):
        """
        Read each line of the doc from the spreadsheet and generate the structure.
        :param sheet_info: Sheet information
        :param doc_sheet_name: Sheet name
        :param all_values: List of all row from the spreadsheet
        :return: Dict of schema or None when got error
        """
        dct_value = None
        line_number = 1
        lst_line = all_values[1:]
        last_iter_level = 0
        line_value = {}

        # This is use to keep reference on last object dependant on level
        lst_level_object = []
        for lst_item in lst_line:
            line_number += 1

            level = lst_item[0]
            name = lst_item[1]
            s_type = lst_item[2]
            title = lst_item[3]
            min_length = lst_item[4]
            pattern = lst_item[5]
            required = lst_item[6]
            min_items = lst_item[7]
            max_items = lst_item[8]
            unique_items = lst_item[9]
            description = lst_item[10]

            if not level:
                continue

            # Validation section

            # Check parameter for line
            # Level is obligated
            if not level.isdigit():
                msg = "The case Level need to be an integer, receive %s" % level
                self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                print(self._error, file=sys.stderr)
                return None
            level = int(level)

            # The next parameter is optional
            # Check if integer
            if min_length:
                if not min_length.isdigit():
                    msg = "The case MinLength need to be an integer, receive %s" % level
                    self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                    print(self._error, file=sys.stderr)
                    return None
                min_length = int(min_length)

            if min_items:
                if not min_items.isdigit():
                    msg = "The case MinItems need to be an integer, receive %s" % level
                    self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                    print(self._error, file=sys.stderr)
                    return None
                min_items = int(min_items)

            if max_items:
                if not max_items.isdigit():
                    msg = "The case MaxItems need to be an integer, receive %s" % level
                    self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                    print(self._error, file=sys.stderr)
                    return None
                max_items = int(max_items)

            if unique_items == "TRUE" or unique_items == "VRAI":
                unique_items = True
            elif unique_items == "FALSE" or unique_items == "FAUX":
                unique_items = False

            # First iteration
            if dct_value is None:
                if level != 1:
                    msg = "First element is not a Level 1."
                    self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                    print(self._error, file=sys.stderr)
                    return None
                dct_value = line_value
                lst_level_object.append(line_value)
            else:
                # All other level

                # Validation
                if level == 1:
                    msg = "Cannot support multiple Level 1 in same sheet."
                    self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                    print(self._error, file=sys.stderr)
                    return None

                if required:
                    msg = "Cannot support required when not Level 1."
                    self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                    print(self._error, file=sys.stderr)
                    return None

                # First element in iteration
                if not last_iter_level:
                    last_iter_level = 1

                # Validate iteration level progression
                nb_level = len(lst_level_object)
                diff_level = level - last_iter_level
                if diff_level > 1:
                    msg = "Cannot increase more than 1 level, but can downgrade more than 1."
                    self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                    print(self._error, file=sys.stderr)
                    return None
                elif diff_level < 0:
                    # Validate last level is completed before pop it
                    last_object = lst_level_object[-1]
                    last_object_type = last_object.get("type")
                    if last_object_type == "object":
                        if "properties" not in last_object:
                            msg = "Need to be a child property of last line %i, object type. " \
                                  "Need to be a level %i." % (line_number - 1, nb_level)
                            self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                            print(self._error, file=sys.stderr)
                            return None
                    elif last_object_type == "array":
                        if "items" not in last_object:
                            msg = "Need to be a child item of last line %i, array type. " \
                                  "Need to be a level %i." % (line_number - 1, nb_level)
                            self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                            print(self._error, file=sys.stderr)
                            return None

                    # Need to pop the list for each level, because we downgrade the list
                    rm_diff_level = nb_level + 1 - level
                    for i in range(rm_diff_level):
                        lst_level_object.pop()

                # Use properties of last element if object, else use item if array
                last_object = lst_level_object[-1]
                last_object_type = last_object.get("type")
                line_value = {}
                if last_object_type == "object":
                    if "properties" not in last_object:
                        last_object["properties"] = {name: line_value}
                    else:
                        last_object["properties"][name] = line_value
                elif last_object_type == "array":
                    if "items" not in last_object:
                        last_object["items"] = line_value
                    else:
                        msg = "Array cannot contain many sub-item."
                        self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                        print(self._error, file=sys.stderr)
                        return None

                # Push in stack when add new object or array
                if s_type in ["object", "array"]:
                    lst_level_object.append(line_value)

                last_iter_level = level

            # Fill data in line_value
            if s_type:
                line_value["type"] = s_type
            if pattern:
                line_value["pattern"] = pattern
            if title:
                line_value["title"] = title
            if required:
                line_value["required"] = required.split()
            if type(min_length) is int:
                line_value["minLength"] = min_length
            if type(min_items) is int:
                line_value["minItems"] = min_items
            if type(max_items) is int:
                line_value["maxItems"] = max_items
            if type(unique_items) is bool:
                line_value["uniqueItems"] = unique_items
            if description:
                line_value["description"] = description

        return dct_value

    def _parse_sheet_type_form(self, sheet_info, doc_sheet_name, all_values):
        """
        Read each line of the doc from the spreadsheet and generate the structure.
        :param sheet_info: Sheet information
        :param doc_sheet_name: Sheet name
        :param all_values: List of all row from the spreadsheet
        :return: List of section to the doc or None when got error
        """
        lst_value = []
        line_number = 1
        lst_line = all_values[1:]
        line_value = {}

        is_form_admin = sheet_info.get("is_admin", False)

        # This is use to keep reference on last object dependant on level
        lst_level_object = [lst_value]
        for lst_item in lst_line:
            line_number += 1

            level = lst_item[0]
            is_admin = lst_item[1]
            s_key = lst_item[2]
            placeholder = lst_item[3]
            s_type = lst_item[4]
            options = lst_item[5]
            value = lst_item[6]
            name = lst_item[7]
            category = lst_item[8]
            add = lst_item[9]
            style = lst_item[10]
            model = lst_item[11]
            read_by_player = lst_item[12]
            read_only_player = lst_item[13]

            if not level:
                continue

            if is_admin == "TRUE" or is_admin == "VRAI":
                is_admin = True
            else:
                is_admin = False

            # Ignore admin field when sheet is not admin
            if not is_form_admin and is_admin:
                continue

            # Validation section
            # Level is obligated
            if not level.isdigit():
                msg = "The case Level need to be an integer, receive %s" % level
                self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                print(self._error, file=sys.stderr)
                return None
            level = int(level)

            # Insert level 1 element
            if level == 1:
                line_value = {}
                lst_value.append(line_value)
            else:
                # level 2 and more
                if not lst_value:
                    msg = "First element is not a Level 1."
                    self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                    print(self._error, file=sys.stderr)
                    return None

                # Validate level with stack
                diff_level = level - len(lst_level_object)
                if diff_level == 1:
                    # All good, fill children
                    pass
                elif diff_level > 1:
                    msg = "Problem with level, maybe you jump a number?"
                    self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                    print(self._error, file=sys.stderr)
                    return None
                else:
                    # Downgrade the stack
                    pos_diff_level = abs(diff_level) + 1
                    for i in range(pos_diff_level):
                        lst_level_object.pop()

                # Get last element from last element in stack
                last_element = lst_level_object[-1][-1]
                last_element_type = last_element.get("type")
                # Section for select
                if last_element_type in ["select", "strapselect"]:
                    title_map = last_element.get("titleMap")
                    line_value = {}
                    if title_map:
                        title_map.append(line_value)
                    else:
                        title_map = [line_value]
                        last_element["titleMap"] = title_map

                    if value:
                        line_value["value"] = value
                    if name:
                        name = name.strip()
                        if name[0] == '"':
                            # Suppose start and end with "
                            name = name[1:-1]
                        line_value["name"] = name
                    if category:
                        line_value["category"] = category

                elif last_element_type == "array":
                    items = last_element.get("items")
                    line_value = {}
                    if items:
                        items.append(line_value)
                    else:
                        items = [line_value]
                        last_element["items"] = items
                    # Add items in stack
                    lst_level_object.append(items)

            if s_key:
                line_value["key"] = s_key
            if s_type:
                line_value["type"] = s_type
            if placeholder:
                # Exception for type submit
                if s_type == "submit":
                    line_value["title"] = placeholder
                else:
                    line_value["placeholder"] = placeholder
            if add:
                line_value["add"] = add
            if options:
                lst_option = options.split(",")
                dct_option = {}
                str_option = ""
                for option in lst_option:
                    count_separator = option.count(":")
                    if count_separator > 1:
                        msg = "Need 1 ':' in options to separate key and value."
                        self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                        print(self._error, file=sys.stderr)
                        return None
                    elif count_separator == 1:
                        k, v = option.split(":")
                        v = v.strip()
                        if v[0] == '"':
                            # Suppose start and end with "
                            v = v[1:-1]
                        elif v[0] == "[":
                            # TODO need to create list for many element with split(",")
                            lst_v = []
                            under_v = v[1:-1]
                            if under_v[0] == '"':
                                under_v = under_v[1:-1]
                            lst_v.append(under_v)
                            v = lst_v
                        elif v.isdigit():
                            v = int(v)
                        dct_option[k] = v
                    else:
                        str_option = option

                if dct_option:
                    line_value["options"] = dct_option
                else:
                    line_value["options"] = str_option

            if style:
                lst_style = style.split(",")
                dct_style = {}
                str_style = ""
                for obj_style in lst_style:
                    count_separator = obj_style.count(":")
                    if count_separator > 1:
                        msg = "Need 1 ':' in style to separate key and value."
                        self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                        print(self._error, file=sys.stderr)
                        return None
                    elif count_separator == 1:
                        k, v = obj_style.split(":")
                        v = v.strip()
                        if v[0] == '"':
                            # Suppose start and end with "
                            v = v[1:-1]
                        elif v[0] == "[":
                            # TODO need to create list for many element with split(",")
                            lst_v = []
                            under_v = v[1:-1]
                            if under_v[0] == '"':
                                under_v = under_v[1:-1]
                            lst_v.append(under_v)
                            v = lst_v
                        elif v.isdigit():
                            v = int(v)

                        dct_style[k] = v
                    else:
                        str_style = style

                if dct_style:
                    line_value["style"] = dct_style
                else:
                    line_value["style"] = str_style

        return lst_value

    def _parse_sheet_type_doc(self, sheet_info, doc_sheet_name, all_values):
        """
        Read each line of the doc from the spreadsheet and generate the structure.
        :param sheet_info: Sheet information
        :param doc_sheet_name: Sheet name
        :param all_values: List of all row from the spreadsheet
        :return: List of section to the doc or None when got error
        """
        lst_doc_section = []
        lst_level_object = []
        line_number = 1
        lst_value = all_values[1:]

        for row in lst_value:
            line_number += 1

            level = row[0]
            # Ignore if level is empty
            if not level:
                continue

            elif level.isdigit():
                # Validate level value
                level = int(level)
                if not (0 < level <= 5):
                    msg = "The field level need to be an integer 1 to 5. Got %s" % level
                    self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                    print(self._error, file=sys.stderr)
                    return
            else:
                msg = "The field level need to be an integer 1 to 5. Type String and got %s" % level
                self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                print(self._error, file=sys.stderr)
                return

            check_contain_value = any(row[1:])
            if not check_contain_value:
                # Ignore empty line
                continue

            admin = row[1]

            is_form_admin = sheet_info.get("is_admin", False)
            if admin == "TRUE" or admin == "VRAI":
                is_admin = True
            else:
                is_admin = False

            # Ignore admin field when sheet is not admin
            if not is_form_admin and is_admin:
                continue

            try:
                # Insert level 1 element
                if level == 1:
                    status = self._extract_section(row, line_number, doc_sheet_name, lst_doc_section, sheet_info)
                    # line_value = lst_doc_section
                    # lst_level_object = lst_doc_section
                    if status:
                        lst_level_object = [lst_doc_section[-1]]
                    elif status is None:
                        continue
                else:
                    # level 2 and more
                    if not lst_level_object:
                        msg = "First element is not a Level 1."
                        self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                        print(self._error, file=sys.stderr)
                        return None

                    # Validate level with stack
                    diff_level = level - len(lst_level_object)
                    if diff_level == 1:
                        # All good, fill children
                        pass
                    elif diff_level > 1:
                        msg = "Problem with level, maybe you jump a number?"
                        self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                        print(self._error, file=sys.stderr)
                        return None
                    else:
                        # Downgrade the stack
                        pos_diff_level = abs(diff_level) + 1
                        for i in range(pos_diff_level):
                            lst_level_object.pop()

                    last_section = lst_level_object[-1]

                    if "section" in last_section:
                        lst_section = last_section.get("section")
                    else:
                        lst_section = []
                        last_section["section"] = lst_section

                    status = self._extract_section(row, line_number, doc_sheet_name, lst_section, sheet_info)

                    if status:
                        lst_level_object.append(lst_section[-1])
                    elif status is None:
                        continue

                if not status:
                    return

            except Exception as e:
                msg = "Unknown case of error: %s" % e
                self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                print(self._error, file=sys.stderr)
                return

            if not status:
                return

        return lst_doc_section

    def _extract_section(self, row, line_number, doc_sheet_name, lst_section, sheet_info):
        """
        Fill the recent section when read the spreadsheet row.
        :param row: The spreadsheet row.
        :param line_number: The row's index of spreadsheet.
        :param lst_section: list of parent section, to append new section.
        :param doc_sheet_name: Sheet name
        :param sheet_info: Sheet information
        :return: True if success, else False
        """

        level = row[0]
        admin = row[1]
        key = row[2]
        title = row[3]
        description = row[4]
        bullet_description = row[5]
        second_bullet_description = row[6]
        under_level_color = row[7]
        sub_key = row[8]
        model = row[9]
        point = row[10]
        hide_player = row[11]

        is_form_admin = sheet_info.get("is_admin", False)
        if admin == "TRUE" or admin == "VRAI":
            is_admin = True
        else:
            is_admin = False

        # Ignore admin field when sheet is not admin
        if not is_form_admin and is_admin:
            return

        # Check error
        if title and not key:
            msg = "Need key when fill title for H%s." % level
            self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
            print(self._error, file=sys.stderr)
            return False

        if description and bullet_description:
            msg = "Cannot have a description and a bullet description on same line for H%s." % level
            self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
            print(self._error, file=sys.stderr)
            return False

        if description and second_bullet_description:
            msg = "Cannot have a description and a second bullet description on same line for H%s." % level
            self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
            print(self._error, file=sys.stderr)
            return False

        if bullet_description and second_bullet_description:
            msg = "Cannot have a bullet description and a second bullet description on same line for H%s." % level
            self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
            print(self._error, file=sys.stderr)
            return False

        # Begin to fill this section
        # If contain title, it's a new section. Else, take the last on the list.
        if key:
            # New section
            section = {"title": key}
            lst_section.append(section)
        else:
            section = lst_section[-1]
            # Cannot continue if contain child section, because the data will be append to parent
            # this will cause a view error
            if "section" in section:
                msg = "Cannot add information on this section when contain sub header on same line for " \
                      "H%s." % level
                self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                print(self._error, file=sys.stderr)
                return False

        # Special title, contain html to improve view
        if title:
            if "title_html" in section:
                msg = "Cannot manage many title_html for H%s." % level
                self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                print(self._error, file=sys.stderr)
                return False
            section["title_html"] = title

        # Description can be append for the same section
        if description:
            # Check if new description
            if "description" not in section:
                lst_description = []
                section["description"] = lst_description
            else:
                lst_description = section.get("description")

            lst_description.append(description)

        # Bullet description can be append for the same description
        if bullet_description:
            # Can create a bullet description if no paragraph description
            if "description" not in section:
                lst_description = []
                section["description"] = lst_description
            else:
                lst_description = section.get("description")

            # Check if last item is a bullet description
            if not (lst_description and type(lst_description[-1]) is list):
                lst_bullet_description = []
                lst_description.append(lst_bullet_description)
            else:
                lst_bullet_description = lst_description[-1]

            # Add the bullet_description
            lst_bullet_description.append(bullet_description)

        if second_bullet_description:
            if "description" not in section:
                msg = "Cannot create second-bullet description missing description for H%s." % level
                self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                print(self._error, file=sys.stderr)
                return False
            lst_description = section.get("description")

            # Check if last item is a bullet description
            if lst_description:
                lst_bullet_description = lst_description[-1]
            else:
                msg = "Cannot create second-bullet description when not precede to bullet description for " \
                      "H%s." % level
                self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                print(self._error, file=sys.stderr)
                return False

            # Create second-bullet description list
            if not lst_bullet_description:
                lst_second_bullet_description = []
                lst_bullet_description.append(lst_second_bullet_description)
            else:
                lst_second_bullet_description = lst_bullet_description[-1]
                # Validate last bullet description is a sub-bullet
                if type(lst_second_bullet_description) is not lst_second_bullet_description:
                    lst_second_bullet_description = []
                    lst_bullet_description.append(lst_second_bullet_description)

                # First second bullet description insertion
                lst_second_bullet_description.append(second_bullet_description)

        if under_level_color:
            # Add color for header
            if "under_level_color" in section:
                msg = "Already contain value of 'Under Level Color'for H%s." % level
                self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                print(self._error, file=sys.stderr)
                return False
            section["under_level_color"] = under_level_color

        # HACK with model
        updated_sub_key = sub_key
        if "habilites" in model:
            updated_sub_key = "habilites_" + sub_key
        elif "technique_maitre" in model:
            updated_sub_key = "technique_maitre_" + sub_key
        elif "merite" in model:
            updated_sub_key = "merite_" + sub_key
        elif "esclave" in model:
            updated_sub_key = "esclave_" + sub_key

        if sub_key:
            section["sub_key"] = sub_key

            # Add manual skill
            if not is_form_admin:
                if bullet_description:
                    self._doc_manual_skill[updated_sub_key] = bullet_description
                elif second_bullet_description:
                    self._doc_manual_skill[updated_sub_key] = second_bullet_description

        if model:
            section["model"] = model
        if not is_form_admin and point and sub_key:
            dct_point = self._transform_point(line_number, doc_sheet_name, point)
            if dct_point is None:
                return False
            section["point"] = dct_point
            # if not sub_key:
            #     msg = "sub_key is empty."
            #     self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
            #     print(self._error, file=sys.stderr)
            #     return False

            if updated_sub_key in self._doc_point:
                # HACK ignore "Contrebande" duplication
                # TODO send a warning about duplication and not a failure
                if "Contrebande" not in updated_sub_key:
                    msg = "Duplicated sub_key : %s" % updated_sub_key
                    self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                    print(self._error, file=sys.stderr)
                    return False

            self._doc_point[updated_sub_key] = dct_point
        if hide_player:
            section["hide_player"] = hide_player
        if admin:
            section["admin"] = admin

        return True

    def _transform_point(self, line_number, doc_sheet_name, str_point):
        dct_point = {}
        lst_point = str_point.split(";")

        for str_single_point in lst_point:
            if not str_single_point:
                continue

            if str_single_point.count(":") != 1:
                msg = "Column 'Point' is wrong. Missing character ':' to separate key with value. " \
                      "Point : %s" % str_point
                self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                print(self._error, file=sys.stderr)
                return

            key, value = str_single_point.split(":")
            if key in dct_point:
                msg = "Duplication key %s. Point : %s" % (key, str_point)
                self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                print(self._error, file=sys.stderr)
                return

            try:
                int_value = int(value)
            except ValueError:
                msg = "Value is not a digital : %s" % value
                self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                print(self._error, file=sys.stderr)
                return

            dct_point[key] = int_value

        return dct_point
