#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import ssl
import stat
import sys

WEB_ROOT_DIR = os.path.dirname(os.path.realpath(__file__))
DEFAULT_SSL_DIRECTORY = os.path.join(WEB_ROOT_DIR, "..", "..", "..", "ssl_cert", "certs")


class HttpSecure(object):
    """
    Manage http security with ssl
    3 cases to support
    1. Not secure http
    2. Only ssl https
    3. Both http and https
    """

    def __init__(self, parser):
        self._arg_parse = parser
        parser.http_secure = self

        self._ssl_options = None
        self._host = ""
        self._port = 0
        self._secure_port = 0
        self._url = ""
        self._set_ssl()
        self._generate_host()

    def _set_ssl(self):
        if self._arg_parse.ssl:
            # ssl cert suppose to be in hostname directory
            cert_file = os.path.join(DEFAULT_SSL_DIRECTORY, self._arg_parse.listen.address, "fullchain.pem")
            key_file = os.path.join(DEFAULT_SSL_DIRECTORY, self._arg_parse.listen.address, "privkey.pem")

            # stop server if permission is wrong, different of 600
            for path_cert in [cert_file, key_file]:
                permission = oct(os.stat(path_cert)[stat.ST_MODE])[-3:]
                if permission != "600":
                    print("Error, expect permission 600 and got %s to file %s" % (permission, path_cert))
                    sys.exit(-1)

            self._ssl_options = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
            if os.path.isfile(cert_file) and os.path.isfile(key_file):
                self._ssl_options.load_cert_chain(certfile=cert_file, keyfile=key_file)
        else:
            self._ssl_options = None

    def _generate_host(self):
        host = self._arg_parse.listen.address
        port = self._arg_parse.listen.port

        if self._arg_parse.redirect_http_to_https:
            if port == 80:
                ssl_port = 443
            else:
                ssl_port = port + 1
        else:
            # force to use only https
            if port == 80:
                ssl_port = 443
            else:
                ssl_port = port

        if self._ssl_options:
            if ssl_port == 443:
                url = "https://{0}".format(host)
            else:
                url = "https://{0}:{1}".format(host, ssl_port)
        else:
            if port == 80:
                url = "http://{0}".format(host)
            else:
                url = "http://{0}:{1}".format(host, port)

        self._url = url
        self._port = port
        self._secure_port = ssl_port
        self._host = host

    def get_host_port_url(self):
        return self._host, self._port, self._url

    def is_secure(self):
        return bool(self._ssl_options)

    def get_ssl_options(self):
        return self._ssl_options

    def get_http_port(self):
        return self._port

    def get_https_port(self):
        return self._secure_port

    def get_main_port(self):
        return self._secure_port

    def has_enable_redirect_http_to_https(self):
        return bool(self._arg_parse.redirect_http_to_https)

    def get_url(self):
        return self._url
