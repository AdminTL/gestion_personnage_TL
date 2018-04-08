#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import io
import zipfile
import os


class ProjectArchive(object):
    def __init__(self, parser):
        # self._error = None
        self._parser = parser

        actual_path_dir = os.path.dirname(os.path.realpath(__file__))
        self._root_project_path = os.path.normpath(os.path.join(actual_path_dir, os.pardir, os.pardir, os.pardir))
        self._project_name = "gestion_personnage_TL"
        self._ignore_directory = [".git", ".idea", "__pycache__"]
        self._ignore_file = [".gitmodules", ".gitignore"]

    def generate_archive(self):
        # debug_writing_file = []
        # Append all data in buffer
        buffer = io.BytesIO()
        with zipfile.ZipFile(buffer, mode="w", compression=zipfile.ZIP_DEFLATED) as zip_mem:
            for root, dirs, files in os.walk(self._root_project_path):
                # Ignore directory
                ignore_dir = False
                for exclude_path in self._ignore_directory:
                    if exclude_path in root:
                        ignore_dir = True
                        break
                if ignore_dir:
                    continue

                for file in files:
                    # Ignore file
                    if file in self._ignore_file:
                        continue

                    file_path = os.path.join(root, file)
                    file_rel_path = file_path[len(self._root_project_path) + 1:]
                    zip_file_path = os.path.join(self._project_name, file_rel_path)
                    # Write file in buffer with zip
                    with open(file_path, mode="r+b") as obj_file:
                        zip_mem.writestr(zip_file_path, obj_file.read())
                        # debug_writing_file.append((file_path, zip_file_path))

        io_buffer = buffer.getvalue()
        return io_buffer

    # def has_error(self):
    #     """
    #
    #     :return: If contain error.
    #     """
    #     return bool(self._error)
    #
    # def get_error(self, create_object=True, force_error=False):
    #     """
    #
    #     :param create_object: if return dict with key "error" or return the message in string
    #     :param force_error: if activate, generate an unknown error message.
    #     :return: information about error.
    #     """
    #     msg = self._error
    #     if not msg and force_error:
    #         msg = "Unknown error."
    #
    #     if create_object:
    #         return {"error": msg}
    #     return msg
