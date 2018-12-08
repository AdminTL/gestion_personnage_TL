#!/usr/bin/env python3
# -*- coding: utf-8 -*-


class AngularEnvironment(object):
    def __init__(self, args):
        self._args = args
        self._lst_thread = []
        self._path_dev = args.db_angular_environment_path
        self._path_prod = args.db_angular_environment_prod_path
        self._use_prod_environment = args.web_environment_prod
        self._auth_keys = args.auth_keys

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

    def _get_template_environment(self, dev=True, use_local_demo_data=False):
        str_prod = """export const environment = {
  production: true,
  enableRouteTracing: false,
  clearCacheOnInit: true,
  useLocalDemoData: %s,
  apiUrl: '%s',
  googleOAuthClientId: "%s",
  facebookAppId: "%s",
};
"""
        str_dev = """// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  enableRouteTracing: false,
  clearCacheOnInit: true,
  useLocalDemoData: %s,
  apiUrl: '%s',
  googleOAuthClientId: "%s",
  facebookAppId: "%s",
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
        data = str_dev if dev else str_prod
        url = self._args.http_secure.get_url()

        str_use_local_demo_data = "true" if use_local_demo_data else "false"
        dct_google_oauth_client_id = self._auth_keys.get("google_oauth")
        if dct_google_oauth_client_id and type(dct_google_oauth_client_id) is dict:
            google_oauth_client_id = dct_google_oauth_client_id.get("key")
        else:
            google_oauth_client_id = ""
        facebook_api_id = self._auth_keys.get("facebook_api_key")
        return_data = data % (str_use_local_demo_data, url, google_oauth_client_id, facebook_api_id)
        return return_data
