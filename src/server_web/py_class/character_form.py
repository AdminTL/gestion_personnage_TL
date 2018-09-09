#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json


class CharacterForm(object):
    """Contains the rules for dynamically generating the character form"""

    def __init__(self, parser):
        self._str_form = ""

        # TODO remove test string
        self._str_form = '[{"title":"section1title","type":"Section","fields":[{"title":"two-line-textbox","lines":2,"hint":"two-line-textbox-hint","type":"Textbox"},{"title":"input","hint":"input-hint","type":"Input"}]},{"title":"section2title","type":"Section","fields":[{"title":"dropdown","lines":2,"hint":"dropdown-hint","type":"Dropdown","options":[{"label":"option1","value":"test"},{"label":"option2","value":"test"},{"label":"option3","value":"test"}]},{"title":"multi-dropdown","lines":2,"hint":"multi-dropdown-hint","type":"MultiselectDropdown","options":[{"label":"option1","value":"test"},{"label":"option2","value":"test"},{"label":"option3","value":"test"}]},{"title":"button","lines":2,"hint":"button-hint","type":"Button"}]}]'

        # TODO access db. Simply uncomment this once the db is setup.
        # self._form_path = parser.db_form_path
        # with open(self._form_path, encoding='utf-8') as form_file:
        #     self._str_form = json.load(form_file)

    def update(self, dct_form, save=False):
        # Transform the object in json string
        self._str_form = json.dumps(dct_form)

        # Save on file
        if save:
            with open(self._form_path, mode="w", encoding='utf-8') as form_file:
                json.dump(dct_form, form_file, indent=2)

    def get_str_all(self):
        return self._str_form
