#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from pynpm import NPMPackage
import threading


class NPM(object):
    def __init__(self, args):
        self._args = args
        self._package_npm = args.db_package_NPM
        self._lst_thread = []

    def run_from_main(self):
        # Compile web client
        if self._args.npm_install:
            self.run_npm_install()
        if self._args.npm_build:
            self.run_npm_build()
        if self._args.npm_build_prod:
            self.run_npm_build_prod()
        if self._args.npm_build_watch:
            self.run_npm_build_watch()
        # self.run_npm_build_fast()

    def run_npm_build_fast(self):
        pkg = NPMPackage(self._package_npm)
        pkg.run_script("build_fast")

    def run_npm_build_prod(self):
        pkg = NPMPackage(self._package_npm)
        pkg.run_script("build_prod")

    def run_npm_build(self):
        pkg = NPMPackage(self._package_npm)
        pkg.run_script("build")

    def run_npm_build_watch(self):
        def coroutine():
            pkg = NPMPackage(self._package_npm)
            pkg.run_script("build_watch")

        t = threading.Thread(target=coroutine)
        self._lst_thread.append(t)
        t.start()

    def run_npm_install(self):
        pkg = NPMPackage(self._package_npm)
        pkg.install()
