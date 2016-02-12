#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import tornado.web


class JsonHandler(tornado.web.RequestHandler):
    """Request handler where requests and responses speak JSON."""

    def prepare_json(self):
        self.params = {}
        # Incorporate request JSON into arguments dictionary.
        if self.request.headers["Content-Type"].startswith("application/json"):
            try:
                data_receive = self.request.body.decode(encoding='UTF-8')
                self.params = json.loads(data_receive)
                # self.request.arguments.update(json_data)
            except ValueError:
                message = 'Unable to parse JSON.'
                self.send_error(400, message=message)  # Bad Request

        # Set up response dictionary.
        self.response = dict()

    def set_default_headers(self):
        self.set_header('Content-Type', 'application/json')

    def write_error(self, status_code, **kwargs):
        if 'message' not in kwargs:
            if status_code == 405:
                print("405 error")
                kwargs['message'] = 'Invalid HTTP method.'
            else:
                print("Unknow error")
                kwargs['message'] = 'Unknown error.'

        self.response = kwargs
        self.write_json()

    def write_json(self):
        output = json.dumps(self.response)
        self.write(output)

    def get_argument(self, name, default=[], strip=True):
        # ignore strip
        return self.params.get(name, default)

    def get_params(self):
        return self.params
