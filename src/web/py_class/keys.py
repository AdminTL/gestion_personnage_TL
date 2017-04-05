#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
from sys import stderr

class Keys(object):
    """Contains keys and secrets needed for third-party authentification."""
    def __init__(self, parser):
        self.keys = {}
        try:
            with open(parser.db_keys_path, encoding='utf-8') as keys_file:
                self.keys = json.load(keys_file)
        except json.decoder.JSONDecodeError as exception:
            print("ERROR: "+parser.db_keys_path+" isn't formatted properly. \n"
                 +"Details: "+str(exception), file=stderr)
        except FileNotFoundError as exception:
            print("WARNING: "+str(exception)+" \nA file has been created for you.")
            with open(parser.db_keys_path, "w", encoding='utf-8') as keys_file:
                keys_file.write("{\n"+
                                "  \"example_key\": \"this is a key\",\n"+
                                "  \"example_secret\": \"this is a secret key\"\n"+
                                "}")
            

    def get(self, key):
        result = self.keys.get(key)
        if result == None:
            print("WARNING: Key \""+str(key)+"\" is not set. Some third-party authentifications may not work properly.", file=stderr)
        return result
