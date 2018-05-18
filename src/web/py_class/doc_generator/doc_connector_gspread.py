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
                "Title H1", "Title H1 HTML", "Description H1", "Bullet Description H1", "Second Bullet Description H1",
                "Under Level Color H1",
                "Title H2", "Title H2 HTML", "Description H2", "Bullet Description H2", "Second Bullet Description H2",
                "Under Level Color H2",
                "Title H3", "Title H3 HTML", "Description H3", "Bullet Description H3", "Second Bullet Description H3",
                "Under Level Color H3",
                "Title H4", "Title H4 HTML", "Description H4", "Bullet Description H4", "Second Bullet Description H4",
                "Under Level Color H4",
                "Title H5", "Title H5 HTML", "Description H5", "Bullet Description H5", "Second Bullet Description H5",
                "Under Level Color H5"
            ]
        elif self.value == self.FORM.value:
            header = [
                "Level", "Key", "Placeholder", "Type", "Options", "Value", "Name", "Category", "Add", "Style"
            ]
        elif self.value == self.SCHEMA.value:
            header = [
                "Level", "Name", "Type", "Title", "minLength", "pattern", "required", "minItems", "maxItems",
                "uniqueItems"
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

        self._info_sheet = [
            {"type": DocType.DOC, "name": "manual", "permission": ["anyone"]},
            {"type": DocType.DOC, "name": "lore", "permission": ["anyone"]},
            {"type": DocType.SCHEMA, "name": "schema_user", "permission": ["user"]},
            {"type": DocType.SCHEMA, "name": "schema_char", "permission": ["user"]},
            {"type": DocType.FORM, "name": "form_user", "permission": ["user"]},
            {"type": DocType.FORM, "name": "form_char", "permission": ["user"]},
            {"type": DocType.FORM, "name": "admin_form_user", "permission": ["admin"]},
            {"type": DocType.FORM, "name": "admin_form_char", "permission": ["admin"]},
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
                info = cb(sheet_name, all_values)
            else:
                self._error = "Internal error, cannot find method to parse the sheet with type %s." % sheet_type
                print(self._error, file=sys.stderr)
                return False

            if info is None:
                # Error in parsing
                return False

            # Compilation of unique result
            dct_doc[sheet_name] = info

        self._generated_doc = dct_doc
        return True

    def _parse_sheet_type_schema(self, doc_sheet_name, all_values):
        """
        Read each line of the doc from the spreadsheet and generate the structure.
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
        for level, name, s_type, title, min_length, pattern, required, min_items, max_items, unique_items in lst_line:
            debug_values = (
                level, name, s_type, title, min_length, pattern, required, min_items, max_items, unique_items)
            line_number += 1

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

        return dct_value

    def _parse_sheet_type_form(self, doc_sheet_name, all_values):
        """
        Read each line of the doc from the spreadsheet and generate the structure.
        :param doc_sheet_name: Sheet name
        :param all_values: List of all row from the spreadsheet
        :return: List of section to the doc or None when got error
        """
        lst_value = []
        line_number = 1
        lst_line = all_values[1:]
        line_value = {}

        # This is use to keep reference on last object dependant on level
        lst_level_object = [lst_value]
        for level, s_key, placeholder, s_type, options, value, name, category, add, style in lst_line:
            # debug_values = (level, s_key, placeholder, s_type, options, value, name, category, add, style)
            line_number += 1

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

    def _parse_sheet_type_doc(self, doc_sheet_name, all_values):
        """
        Read each line of the doc from the spreadsheet and generate the structure.
        :param doc_sheet_name: Sheet name
        :param all_values: List of all row from the spreadsheet
        :return: List of section to the doc or None when got error
        """
        lst_doc_section = []
        line_number = 1
        first_section = None
        second_section = None
        third_section = None
        status = False

        lst_value = all_values[1:]
        if not lst_value:
            # List is empty
            status = True

        for row in lst_value:
            line_number += 1
            is_first_section = any(row[0:5])
            is_second_section = any(row[6:11])
            is_third_section = any(row[12:17])
            is_fourth_section = any(row[18:23])
            is_fifth_section = any(row[24:29])

            # Check error
            sum_section = sum(
                (is_first_section, is_second_section, is_third_section, is_fourth_section, is_fifth_section))

            if sum_section == 0:
                # Ignore empty line
                continue

            try:
                if sum_section > 1:
                    msg = "Cannot contain more than 1 section at time. H1: %s, H2: %s, H3: %s, H4: %s, H5: %s." % (
                        is_first_section, is_second_section, is_third_section, is_fourth_section, is_fifth_section)

                    self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                    print(self._error, file=sys.stderr)
                    return

                if is_first_section:
                    status = self._extract_section(0, row, line_number, doc_sheet_name, lst_doc_section)

                elif is_second_section:
                    second_section = None
                    third_section = None
                    first_section = lst_doc_section[-1]

                    # Get section from last section
                    if "section" in first_section:
                        lst_section = first_section.get("section")
                    else:
                        lst_section = []
                        first_section["section"] = lst_section

                    status = self._extract_section(1, row, line_number, doc_sheet_name, lst_section)

                elif is_third_section:
                    third_section = None
                    if not first_section:
                        msg = "Missing section H1 to insert section H3."
                        self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                        print(self._error, file=sys.stderr)
                        return

                    lst_section = first_section.get("section")
                    if not lst_section:
                        msg = "Missing section H2 to insert section H3."
                        self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                        print(self._error, file=sys.stderr)
                        return

                    second_section = lst_section[-1]

                    # Get section from last section
                    if "section" in second_section:
                        lst_section = second_section.get("section")
                    else:
                        lst_section = []
                        second_section["section"] = lst_section

                    status = self._extract_section(2, row, line_number, doc_sheet_name, lst_section)

                elif is_fourth_section:
                    if not first_section:
                        msg = "Missing section H1 to insert section H4."
                        self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                        print(self._error, file=sys.stderr)
                        return

                    if not second_section:
                        msg = "Missing section H2 to insert section H4."
                        self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                        print(self._error, file=sys.stderr)
                        return

                    # Create third_section
                    lst_section = second_section.get("section")
                    if not lst_section:
                        msg = "Missing section H3 to insert section H4."
                        self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                        print(self._error, file=sys.stderr)
                        return

                    third_section = lst_section[-1]

                    # Get section from last section
                    if "section" in third_section:
                        lst_section = third_section.get("section")
                    else:
                        lst_section = []
                        third_section["section"] = lst_section

                    status = self._extract_section(3, row, line_number, doc_sheet_name, lst_section)

                elif is_fifth_section:
                    if not first_section:
                        msg = "Missing section H1 to insert section H5."
                        self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                        print(self._error, file=sys.stderr)
                        return

                    if not second_section:
                        msg = "Missing section H2 to insert section H5."
                        self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                        print(self._error, file=sys.stderr)
                        return

                    if not third_section:
                        msg = "Missing section H3 to insert section H5."
                        self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                        print(self._error, file=sys.stderr)
                        return

                    # Create third_section
                    lst_section = third_section.get("section")
                    if not lst_section:
                        msg = "Missing section H4 to insert section H5."
                        self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                        print(self._error, file=sys.stderr)
                        return

                    fourth_section = lst_section[-1]

                    # Get section from last section
                    if "section" in fourth_section:
                        lst_section = fourth_section.get("section")
                    else:
                        lst_section = []
                        fourth_section["section"] = lst_section

                    status = self._extract_section(4, row, line_number, doc_sheet_name, lst_section)

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

    def _extract_section(self, level, row, line_number, doc_sheet_name, lst_section):
        """
        Fill the recent section when read the spreadsheet row.
        :param level: The level of section, 0 to 4.
        :param row: The spreadsheet row.
        :param line_number: The row's index of spreadsheet.
        :param lst_section: list of parent section, to append new section.
        :param doc_sheet_name: Sheet name
        :return: True if success, else False
        """
        if not (0 <= level <= 4):
            msg = "Internal error, support only level 1 to 5 and got: %s" % level + 1
            self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
            print(self._error, file=sys.stderr)
            return False

        nb_column = 6
        i_column = level * nb_column
        header_lvl = level + 1

        title = row[i_column]
        title_html = row[i_column + 1]
        description = row[i_column + 2]
        bullet_description = row[i_column + 3]
        second_bullet_description = row[i_column + 4]
        under_level_color = row[i_column + 5]

        # Check error
        if title_html and not title:
            msg = "Need title when fill title html for H%s." % header_lvl
            self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
            print(self._error, file=sys.stderr)
            return False

        if description and bullet_description:
            msg = "Cannot have a description and a bullet description on same line for H%s." % header_lvl
            self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
            print(self._error, file=sys.stderr)
            return False

        if description and second_bullet_description:
            msg = "Cannot have a description and a second bullet description on same line for H%s." % header_lvl
            self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
            print(self._error, file=sys.stderr)
            return False

        if bullet_description and second_bullet_description:
            msg = "Cannot have a bullet description and a second bullet description on same line for H%s." % header_lvl
            self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
            print(self._error, file=sys.stderr)
            return False

        # Begin to fill this section
        # If contain title, it's a new section. Else, take the last on the list.
        if title:
            # New section
            section = {"title": title}
            lst_section.append(section)
        else:
            section = lst_section[-1]
            # Cannot continue if contain child section, because the data will be append to parent
            # this will cause a view error
            if "section" in section:
                msg = "Cannot add information on this section when contain sub header on same line for " \
                      "H%s." % header_lvl
                self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                print(self._error, file=sys.stderr)
                return False

        # Special title, contain html to improve view
        if title_html:
            if "title_html" in section:
                msg = "Cannot manage many title_html for H%s." % header_lvl
                self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                print(self._error, file=sys.stderr)
                return False
            section["title_html"] = title_html

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
                msg = "Cannot create second-bullet description missing description for H%s." % header_lvl
                self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                print(self._error, file=sys.stderr)
                return False
            lst_description = section.get("description")

            # Check if last item is a bullet description
            if lst_description:
                lst_bullet_description = lst_description[-1]
            else:
                msg = "Cannot create second-bullet description when not precede to bullet description for " \
                      "H%s." % header_lvl
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
                msg = "Already contain value of 'Under Level Color'for H%s." % header_lvl
                self._error = "L.%s S.%s: %s" % (line_number, doc_sheet_name, msg)
                print(self._error, file=sys.stderr)
                return False
            section["under_level_color"] = under_level_color

        return True
