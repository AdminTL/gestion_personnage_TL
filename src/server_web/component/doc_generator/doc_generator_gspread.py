#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import gspread
from oauth2client.service_account import ServiceAccountCredentials
from .doc_connector_gspread import DocConnectorGSpread


class DocGeneratorGSpread(object):
    """
    Generate documentation with google drive spreadsheet.

    Manage file configuration and Google authentication.

    This class generate instance of DocConnectorGSpread.
    """

    def __init__(self, parser):
        self._parser = parser

        self._gc = None
        self._gc_email = ""
        self._url = ""
        self._google_file = None
        self._doc_connector = None

        self._error = None

        self._msg_invite_share = self._parser.config.get("msg_email_share_document")

    def get_instance(self):
        """
        Return DocConnectorGSpread instance.
        :return: instance of DocConnectorGSpread
        """
        self._error = None

        # Return doc connector if is valid, else generate a new one
        if self._doc_connector:
            # Need to check if need to reload document
            self._doc_connector.check_has_permission()
            if self._doc_connector.is_auth_valid():
                return self._doc_connector

        status = self.connect(force_connect=True)
        if not status:
            return

        status = self.update_url(ignore_error=True)
        if not status:
            return

        obj = DocConnectorGSpread(self._gc, self._google_file, self._msg_invite_share)
        self._doc_connector = obj
        return obj

    def update_url(self, url=None, save=False, ignore_error=False):
        """
        Validate the url, open a new document and can save to configuration file.
        :param url: New URL to update.
        :param save: If True, save the url to configuration file if valid.
        :param ignore_error: Can update url without generate error.
        :return: True if success else False
        """
        has_open_file = False
        status = False

        if url:
            status = self._open_file_by_url(url)
            if status:
                has_open_file = True
                self._url = url
                self._doc_connector = None
            elif not ignore_error:
                return
        else:
            info = self._fetch_config()
            if info:
                status = self._open_file_by_url(info)
                self._url = info
                has_open_file = True
                self._doc_connector = None
            elif not ignore_error:
                msg = "Cannot open file from empty config."
                raise Exception(msg)

        if not has_open_file and not ignore_error:
            msg = "Missing url to open the remote file."
            raise Exception(msg)

        if has_open_file and save:
            # Open config file
            self._parser.config.update("google_spreadsheet.file_url", url, save=True)

        return status

    def is_auth(self):
        """

        :return: If auth with oauth2
        """
        return bool(self._gc)

    def is_file_open(self):
        """

        :return: If auth with oauth2
        """
        return bool(self._google_file)

    def has_error(self):
        """

        :return: If instance of DocGeneratorGSpread contain error.
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

    def get_url(self):
        """
        Get the url of the remote document.
        :return: String of URL
        """
        return self._url

    def get_email_service(self):
        """
        Get email to communicate with google service.
        :return: string of email
        """
        return self._gc_email

    def connect(self, force_connect=False):
        """
        Do authentication with oauth2 of Google
        :return: Success if True else Fail
        """
        if self._gc is None or force_connect:
            scope = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']
            try:
                # Get credentials about oauth2 Service
                credentials = ServiceAccountCredentials.from_json_keyfile_name(self._parser.db_google_API_path, scope)
            except FileNotFoundError:
                msg = "Missing file %s to configure Google Drive Spreadsheets." % \
                      self._parser.db_google_API_path
                raise Exception(msg)

            # Send http request to get authorization
            self._gc = gspread.authorize(credentials)
            if not self._gc:
                msg = "Cannot connect to Google API Drive."
                raise Exception(msg)

            # Store useful information about account
            self._gc_email = credentials.service_account_email

        # Reinitialize error
        self._error = None
        return True

    def _open_file_by_name(self, name):
        """
        Open remote file by name.
        :param name: type String name to open
        :return: bool True if success else False if fail
        """
        try:
            google_file = self._gc.open(name)
        except gspread.SpreadsheetNotFound:
            msg = "Cannot open google file from name : %s" % name
            raise Exception(msg)

        self._google_file = google_file
        return True

    def _open_file_by_key(self, key):
        """
        Open remote file by key.
        :param key: type String key to open
        :return: bool True if success else False if fail
        """
        try:
            google_file = self._gc.open_by_key(key)
        except gspread.SpreadsheetNotFound:
            msg = "Cannot open google file from key : %s" % key
            raise Exception(msg)

        self._google_file = google_file
        return True

    def _open_file_by_url(self, url):
        """
        Open remote file by url.
        :param url: type String url to open
        :return: bool True if success else False if fail
        """
        try:
            google_file = self._gc.open_by_url(url)
        except gspread.SpreadsheetNotFound:
            msg = "Cannot open google file from url : %s" % url
            raise Exception(msg)
        except gspread.NoValidUrlKeyFound:
            msg = "Cannot open google file from invalid url : %s" % url
            raise Exception(msg)

        self._google_file = google_file
        return True

    def _fetch_config(self):
        """
        Search file information to fetch from remote in config file.
        Enable type of way to access to the remote file.
        :return: String information if contain data, else None
        """
        # Get by url
        info = self._parser.config.get("google_spreadsheet.file_url")
        return info
