#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
import gspread


class DocConnectorGSpread:
    """
    DocConnectorGSpread manage doc generation parsing and Google spreadsheet functionality.

    Use DocGeneratorGSpread to get instance of DocGeneratorGSpread.
    This is more secure for multi-thread execution
    """

    def __init__(self, gc, gc_doc, msg_share_invite):
        self._gc = gc
        self._g_file = gc_doc

        self._generated_doc = None
        self._error = None
        self._connector_is_valid = True
        self._msg_share_invite = msg_share_invite

        self._info_sheet_name = ["manual", "lore"]
        self._info_header = [
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

        for doc_sheet_name in self._info_sheet_name:
            # Find working sheet
            for sheet in worksheet_list:
                if sheet.title == doc_sheet_name:
                    manual_sheet = sheet
                    break
            else:
                lst_str_worksheet = [sheet.title for sheet in worksheet_list]
                self._error = "Sheet '%s' not exist. Existing sheet: %s" % (doc_sheet_name, lst_str_worksheet)
                print(self._error, file=sys.stderr)
                return False

            # Validate the header
            header_row = manual_sheet.row_values(1)
            if self._info_header != header_row:
                self._error = "Header of sheet %s is %s, and expected is %s" % (
                    doc_sheet_name, header_row, self._info_header)
                print(self._error, file=sys.stderr)
                return False

            # Fetch all line
            all_values = manual_sheet.get_all_values()
            info = self._parse_doc(doc_sheet_name, all_values)
            if info is None:
                return False

            dct_doc[doc_sheet_name] = info

        self._generated_doc = dct_doc
        return True

    def get_generated_doc(self):
        """
        Property of generated_doc
        :return: return False if the document is not generated, else return the dict
        """
        if self._generated_doc:
            return self._generated_doc
        return False

    def _parse_doc(self, doc_sheet_name, all_values):
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

            if sum_section > 1:
                self._error = "L.%s S.%s: Cannot contain more than 1 section at time. " \
                              "H1: %s, H2: %s, H3: %s, H4: %s, H5: %s." % (
                                  line_number, doc_sheet_name, is_first_section, is_second_section, is_third_section,
                                  is_fourth_section,
                                  is_fifth_section)
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
                    self._error = "L.%s S.%s: Missing section H1 to insert section H3." % (line_number, doc_sheet_name)
                    print(self._error, file=sys.stderr)
                    return

                lst_section = first_section.get("section")
                if not lst_section:
                    self._error = "L.%s S.%s: Missing section H2 to insert section H3." % (line_number, doc_sheet_name)
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
                    self._error = "L.%s S.%s: Missing section H1 to insert section H4." % (line_number, doc_sheet_name)
                    print(self._error, file=sys.stderr)
                    return

                if not second_section:
                    self._error = "L.%s S.%s: Missing section H2 to insert section H4." % (line_number, doc_sheet_name)
                    print(self._error, file=sys.stderr)
                    return

                # Create third_section
                lst_section = second_section.get("section")
                if not lst_section:
                    self._error = "L.%s S.%s: Missing section H3 to insert section H4." % (line_number, doc_sheet_name)
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
                    self._error = "L.%s S.%s: Missing section H1 to insert section H5." % (line_number, doc_sheet_name)
                    print(self._error, file=sys.stderr)
                    return

                if not second_section:
                    self._error = "L.%s S.%s: Missing section H2 to insert section H5." % (line_number, doc_sheet_name)
                    print(self._error, file=sys.stderr)
                    return

                if not third_section:
                    self._error = "L.%s S.%s: Missing section H3 to insert section H5." % (line_number, doc_sheet_name)
                    print(self._error, file=sys.stderr)
                    return

                # Create third_section
                lst_section = third_section.get("section")
                if not lst_section:
                    self._error = "L.%s S.%s: Missing section H4 to insert section H5." % (line_number, doc_sheet_name)
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
            self._error = "L.%s S.%s: Internal error, support only level 1 to 5 and got: %s" % (
                line_number, doc_sheet_name, level + 1)
            print(self._error, file=sys.stderr)
            return False

        nb_column = 6
        i_column = level * nb_column

        title = row[i_column]
        title_html = row[i_column + 1]
        description = row[i_column + 2]
        bullet_description = row[i_column + 3]
        second_bullet_description = row[i_column + 4]
        under_level_color = row[i_column + 5]

        # Check error
        if title_html and not title:
            self._error = "L.%s S.%s: Need title when fill title html for H%s." % (
                line_number, doc_sheet_name, i_column)
            print(self._error, file=sys.stderr)
            return False

        if description and bullet_description:
            self._error = "L.%s S.%s: Cannot have a description and a bullet description " \
                          "on same line for H%s." % (line_number, doc_sheet_name, i_column)
            print(self._error, file=sys.stderr)
            return False

        if description and second_bullet_description:
            self._error = "L.%s S.%s: Cannot have a description and a second bullet description " \
                          "on same line for H%s." % (line_number, doc_sheet_name, i_column)
            print(self._error, file=sys.stderr)
            return False

        if bullet_description and second_bullet_description:
            self._error = "L.%s S.%s: Cannot have a bullet description and a second bullet description " \
                          "on same line for H%s." % (line_number, doc_sheet_name, i_column)
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
                self._error = "L.%s S.%s: Cannot add information on this section when contain sub header " \
                              "on same line for H%s." % (line_number, doc_sheet_name, i_column)
                print(self._error, file=sys.stderr)
                return False

        # Special title, contain html to improve view
        if title_html:
            if "title_html" in section:
                self._error = "L.%s S.%s: Cannot manage many title_html for H%s." % (
                    line_number, doc_sheet_name, i_column)
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
                self._error = "L.%s S.%s: Cannot create second-bullet description missing description " \
                              "for H%s." % (line_number, doc_sheet_name, i_column)
                print(self._error, file=sys.stderr)
                return False
            lst_description = section.get("description")

            # Check if last item is a bullet description
            if lst_description:
                lst_bullet_description = lst_description[-1]
            else:
                self._error = "L.%s S.%s: Cannot create second-bullet description when not precede to bullet " \
                              "description for H%s." % (line_number, doc_sheet_name, i_column)
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
                self._error = "L.%s S.%s: Already contain value of 'Under Level Color'for H%s." % (
                    line_number, doc_sheet_name, i_column)
                print(self._error, file=sys.stderr)
                return False
            section["under_level_color"] = under_level_color

        return True
