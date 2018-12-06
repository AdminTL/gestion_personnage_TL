#!/usr/bin/env python3
# -*- coding: utf-8 -*-


class AngularEnvironment(object):
    def __init__(self, args):
        self._args = args
        self._lst_thread = []
        self._path_dev = args.db_angular_environment_path
        self._path_prod = args.db_angular_environment_prod_path
        self._use_prod_environment = args.web_environment_prod

    def run_from_main(self):
        # if not self._use_prod_environment:
        #     self._write_web_environment()
        self._write_web_environment()

    def _write_web_environment(self):
        data = self._get_template_environment(dev=not self._use_prod_environment)
        if not data:
            return
        file_path = self._path_prod if self._use_prod_environment else self._path_dev
        with open(file_path, "w") as file:
            file.write(data)

    def _get_template_environment(self, dev=True):
        str_prod = """export const environment = {
  production: true,
  enableRouteTracing: false,
  clearCacheOnInit: true,
  apiUrl: 'http://localhost:8000'
};
"""
        str_dev = """// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  enableRouteTracing: false,
  clearCacheOnInit: true,
  apiUrl: 'http://localhost:8000'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
"""
        if dev:
            return str_dev
        return str_prod
