#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import tornado
import tornado.web
import tornado.auth
import sys
import base_handler
import jsonhandler
import os
import datetime

io_loop = tornado.ioloop.IOLoop.instance()
config_path = "config"

ENABLE_FACEBOOK_FEED = False


def ioloop_wrapper(callback):
    # use this for async call
    def func(*args, **kwargs):
        io_loop.add_callback(callback, *args, **kwargs)

    return func


class AutoSSLHandler(tornado.web.RequestHandler):
    @tornado.web.asynchronous
    def get(self):
        # check directory exist
        path_acme_challenge = os.path.join(os.getcwd(), "..", "..", "ssl_cert", "acme-challenge")
        if not os.path.isdir(path_acme_challenge):
            print("Error, the path %s not exist." % path_acme_challenge, file=sys.stderr)
            # Not found
            self.set_status(404)
            self.send_error(404)
            raise tornado.web.Finish()

        # check file exist
        files = os.listdir(path_acme_challenge)
        if not files:
            print("Error, no files in path %s" % path_acme_challenge, file=sys.stderr)
            # Not found
            self.set_status(404)
            self.send_error(404)
            raise tornado.web.Finish()

        first_file_path = os.path.join(path_acme_challenge, files[0])
        first_file = open(first_file_path, 'r')

        # send the reading file
        self.write(first_file.read())
        self.finish()


class IndexHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        self.render('news.html', enable_facebook_feed=ENABLE_FACEBOOK_FEED, **self._global_arg)


class ManualPageHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        self.render('manual.html', **self._global_arg)


class LorePageHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        self.render('lore.html', **self._global_arg)


class LoginHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        if self.get_current_user():
            self.redirect("/profile")
            return

        self.render('login.html', **self._global_arg)

    @tornado.web.asynchronous
    def post(self):
        if self._global_arg["disable_login"]:
            self.redirect("/")
            return

        if self.get_current_user():
            print("Need to logout before login or sign up from %s" % self.request.remote_ip, file=sys.stderr)
            # Bad request
            self.set_status(400)
            self.send_error(400)
            raise tornado.web.Finish()

        # EXTREMELY IMPORTANT to prevent accessing accounts that do not yet have a password.
        password = self.get_argument("password")
        if not password:
            print("Password is empty from %s" % self.request.remote_ip, file=sys.stderr)
            self.redirect("/login?invalid=password")
            return

        # Login
        if self.get_argument("username_or_email", default=""):

            username_or_email = self.get_argument("username_or_email", default="")
            if not username_or_email:
                print("Email or Username is empty.", file=sys.stderr)
                self.redirect("/login?invalid=username_or_email")
                return

            # Try finding the user by mail...
            user = None
            if "@" in username_or_email:
                user = self._db.get_user(email=username_or_email, password=password)
            # ... or by name.
            if not user:
                user = self._db.get_user(username=username_or_email, password=password)

            # If user is found, give him a secure cookie based on his user id
            if user:
                self.give_cookie(user.get("user_id"))
                return
            else:
                print("Invalid email/password combination from %s" % self.request.remote_ip, file=sys.stderr)
                self.redirect("/login?invalid=login")
                return

        # Sign Up
        elif self.get_argument("username", default=""):
            username = self.get_argument("username", default="")
            if not username:
                print("Username is empty from %s" % self.request.remote_ip, file=sys.stderr)
                self.redirect("/login?invalid=username")
                return

            email = self.get_argument("email", default=None)
            name = self.get_argument("name", default=None)
            postal_code = self.get_argument("postal_code", default=None)

            # TODO uncomment when need to validate email
            # if self._db.create_user(username, name=name, email=email, password=password, postal_code=postal_code):
            #     self.redirect("/login")
            #     return
            # else:
            #     self.redirect("/login?invalid=signup")
            #     return
            # TODO comment when need to validate email
            if email:
                email = email.lower()

            user = self._db.create_user(username, name=name, email=email, password=password, postal_code=postal_code)
            if user:
                self.give_cookie(user.get("user_id"))
                return
            else:
                self.redirect("/login?invalid=signup")
                return

        self.redirect("/login")


class GoogleOAuth2LoginHandler(base_handler.BaseHandler, tornado.auth.GoogleOAuth2Mixin):
    @tornado.gen.coroutine
    def get(self):
        try:
            if self.get_argument('code', False):
                google_user = yield self.get_authenticated_user(
                    redirect_uri=self._global_arg["url"] + '/cmd/auth/google',
                    code=self.get_argument('code'))

                # Cancel by the user or other reason
                if not google_user:
                    self.redirect("/login?invalid=google")
                    return

                access_token = google_user.get("access_token")
                google_user = yield self.oauth2_request("https://www.googleapis.com/oauth2/v1/userinfo",
                                                        access_token=access_token)

                # Cancel by the user or other reason
                if not google_user:
                    self.redirect("/login?invalid=google")
                    return

                # Save the user with e.g. set_secure_cookie
                google_id = google_user.get("id")
                user = self._db.get_user(id_type="google", user_id=google_id)

                # Login
                # If user is found, give him a secure cookie based on his user_id and Google access_token
                if user:
                    self.give_cookie(user.get("user_id"), google_access_token=access_token)
                    return

                # Sign up
                else:
                    username = google_user.get("name")
                    email = google_user.get("email")
                    verified_email = google_user.get("verified_email")
                    name = google_user.get("name")
                    given_name = google_user.get("given_name")
                    family_name = google_user.get("family_name")
                    locale = google_user.get("locale")

                    # check if email exist or name. If yes, associate it with this account
                    if self._db.user_exist(email=email):
                        # use this email to associate
                        user = self._db.get_user(email=email, force_email_no_password=True)
                        if user:
                            self._db.add_missing_info_user(user, google_id=google_id, verified_email=verified_email,
                                                           given_name=given_name, family_name=family_name,
                                                           locale=locale)
                    else:
                        user = self._db.create_user(username, email=email, google_id=google_id,
                                                    verified_email=verified_email, name=name, given_name=given_name,
                                                    family_name=family_name, locale=locale)

                    if user:
                        self.give_cookie(user.get("user_id"), google_access_token=access_token)
                        return
                    else:
                        self.redirect("/login?invalid=google")
                        return

            else:
                yield self.authorize_redirect(
                    redirect_uri=self._global_arg["url"] + '/cmd/auth/google',
                    client_id=self.settings['google_oauth']['key'],
                    scope=['profile', 'email'],
                    response_type='code',
                    extra_params={'approval_prompt': 'auto'})

        except KeyError as exception:
            print("KeyError: " + str(exception) + " in GoogleOAuth2LoginHandler from %s" % self.request.remote_ip,
                  file=sys.stderr)
            self.redirect("/login?invalid=google")
            return
        except Exception as e:
            print("Exception: " + str(e) + " in GoogleOAuth2LoginHandler from %s" % self.request.remote_ip,
                  file=sys.stderr)
            self.redirect("/login?invalid=google")
            return


class FacebookGraphLoginHandler(base_handler.BaseHandler, tornado.auth.FacebookGraphMixin):
    @tornado.gen.coroutine
    def get(self):
        try:
            if self.get_argument("code", False):
                facebook_user = yield self.get_authenticated_user(
                    redirect_uri=self._global_arg["url"] + '/cmd/auth/facebook',
                    client_id=self.settings["facebook_api_key"],
                    client_secret=self.settings["facebook_secret"],
                    code=self.get_argument("code"),
                    extra_fields=["email"])

                # Cancel by the user or other reason
                if not facebook_user:
                    self.redirect("/login?invalid=facebook")
                    return

                access_token = facebook_user.get("access_token")

                facebook_id = facebook_user.get("id")
                user = self._db.get_user(id_type="facebook", user_id=facebook_id)

                # Login
                # If user is found, give him a secure cookie based on his user_id and Facebook access_token
                if user:
                    self.give_cookie(user.get("user_id"), facebook_access_token=access_token)
                    return

                # Sign up
                else:
                    username = facebook_user.get("name")
                    email = facebook_user.get("email")
                    name = facebook_user.get("name")
                    given_name = facebook_user.get("first_name")
                    family_name = facebook_user.get("last_name")
                    locale = facebook_user.get("locale")

                    # check if email exist or name. If yes, associate it with this account
                    if self._db.user_exist(email=email):
                        # use this email to associate
                        user = self._db.get_user(email=email, force_email_no_password=True)
                        if user:
                            self._db.add_missing_info_user(user, facebook_id=facebook_id, given_name=given_name,
                                                           family_name=family_name, locale=locale)
                    else:
                        user = self._db.create_user(username, name=name, given_name=given_name, family_name=family_name,
                                                    locale=locale, email=email, facebook_id=facebook_id)

                    if user:
                        self.give_cookie(user.get("user_id"), facebook_access_token=access_token)
                        return
                    else:
                        self.redirect("/login?invalid=facebook")
                        return

            else:
                yield self.authorize_redirect(
                    redirect_uri=self._global_arg["url"] + '/cmd/auth/facebook',
                    client_id=self.settings["facebook_api_key"],
                    # Permissions: https://developers.facebook.com/docs/facebook-login/permissions
                    extra_params={"scope": "email"})

        except KeyError as exception:
            print("KeyError: " + str(exception) + " in FacebookGraphLoginHandler from %s" % self.request.remote_ip,
                  file=sys.stderr)
            self.redirect("/login?invalid=facebook")
            return
        except Exception as e:
            print("Exception: " + str(e) + " in FacebookGraphLoginHandler from %s" % self.request.remote_ip,
                  file=sys.stderr)
            self.redirect("/login?invalid=facebook")
            return


class TwitterLoginHandler(base_handler.BaseHandler, tornado.auth.TwitterMixin):
    @tornado.gen.coroutine
    def get(self):
        try:
            if self.get_argument("oauth_token", False):
                twitter_user = yield self.get_authenticated_user()

                # Cancel by the user or other reason
                if not twitter_user:
                    self.redirect("/login?invalid=twitter")
                    return

                access_token = twitter_user.get("access_token")
                twitter_user = yield self.twitter_request("/account/verify_credentials",
                                                          access_token=access_token, include_email="true")

                # Cancel by the user or other reason
                if not twitter_user:
                    self.redirect("/login?invalid=twitter")
                    return

                twitter_id = twitter_user.get("id_str")
                user = self._db.get_user(id_type="twitter", user_id=twitter_id)

                # Login
                # If user is found, give him a secure cookie based on his user_id and Twitter access_token
                if user:
                    self.give_cookie(user.get("user_id"), twitter_access_token=access_token)
                    return

                # Sign up
                else:
                    username = twitter_user.get("screen_name")
                    name = twitter_user.get("name")
                    email = twitter_user.get("email")
                    verified_email = twitter_user.get("verified")
                    locale = twitter_user.get("lang")

                    # check if email exist or name. If yes, associate it with this account
                    if self._db.user_exist(email=email):
                        # use this email to associate
                        user = self._db.get_user(email=email, force_email_no_password=True)
                        if user:
                            self._db.add_missing_info_user(user, twitter_id=twitter_id, verified_email=verified_email,
                                                           locale=locale)
                    else:
                        user = self._db.create_user(username, email=email, name=name, verified_email=verified_email,
                                                    locale=locale, twitter_id=twitter_id)

                    if user:
                        self.give_cookie(user.get("user_id"), twitter_access_token=access_token)
                        return
                    else:
                        self.redirect("/login?invalid=twitter")
                        return
            elif self.get_argument("denied", False):
                self.redirect("/login?invalid=twitter")
                return
            else:
                yield self.authorize_redirect(callback_uri=self._global_arg["url"] + '/cmd/auth/twitter')
        except KeyError as e:
            print("KeyError: " + str(e) + " in TwitterLoginHandler from %s" % self.request.remote_ip,
                  file=sys.stderr)
            self.redirect("/login?invalid=twitter")
            return
        except Exception as e:
            print("Exception: " + str(e) + " in TwitterLoginHandler from %s" % self.request.remote_ip, file=sys.stderr)
            self.redirect("/login?invalid=twitter")
            return


class LogoutHandler(base_handler.BaseHandler):
    def get(self):
        if self._global_arg["disable_login"]:
            # Not found
            self.set_status(404)
            self.send_error(404)
            raise tornado.web.Finish()

        if self.current_user:
            self.clear_cookie("user")
            self.redirect("/")
            return
        else:
            self.redirect("/login")
            return


class AdminHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    @tornado.web.authenticated
    def get(self):
        if self._global_arg["disable_admin"] or self._global_arg["disable_login"]:
            # Not Found
            self.set_status(404)
            self.send_error(404)
            raise tornado.web.Finish()
        if self.is_permission_admin():
            self.render('admin/news.html', **self._global_arg)
        else:
            print("Insufficient permissions from %s" % self.request.remote_ip, file=sys.stderr)
            # Forbidden
            self.set_status(403)
            self.send_error(403)
            raise tornado.web.Finish()


class AdminCharacterHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    @tornado.web.authenticated
    def get(self):
        if self._global_arg["disable_admin"]:
            # Not Found
            self.set_status(404)
            self.send_error(404)
            raise tornado.web.Finish()
        if self.is_permission_admin():
            self.render('admin/character.html', **self._global_arg)
        else:
            print("Insufficient permissions from %s" % self.request.remote_ip, file=sys.stderr)
            # Forbidden
            self.set_status(403)
            self.send_error(403)
            raise tornado.web.Finish()


class AdminEditorHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    @tornado.web.authenticated
    def get(self):
        if self._global_arg["disable_admin"]:
            # Not Found
            self.set_status(404)
            self.send_error(404)
            raise tornado.web.Finish()

        if self.is_permission_admin():
            self.render('admin/editor.html', **self._global_arg)
        else:
            print("Insufficient permissions from %s" % self.request.remote_ip, file=sys.stderr)
            # Forbidden
            self.set_status(403)
            self.send_error(403)
            raise tornado.web.Finish()


class AdminSettingHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    @tornado.web.authenticated
    def get(self):
        if self._global_arg["disable_admin"]:
            # Not Found
            self.set_status(404)
            self.send_error(404)
            raise tornado.web.Finish()

        if self.is_permission_admin():
            self.render('admin/setting.html', **self._global_arg)
        else:
            print("Insufficient permissions from %s" % self.request.remote_ip, file=sys.stderr)
            # Forbidden
            self.set_status(403)
            self.send_error(403)
            raise tornado.web.Finish()


class ProfileHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    @tornado.web.authenticated
    def get(self, user_id=None):
        if self._global_arg["disable_login"]:
            # # Not Found
            # self.set_status(404)
            # self.send_error(404)
            # raise tornado.web.Finish()
            # don't crash, just redirect to main site
            self.redirect("/")
            return
        if user_id:
            user = self._db.get_user(user_id=user_id)
        else:
            user = self.current_user
        self.render('profile.html', user=user, **self._global_arg)


class CharacterHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        # don't block the page when disable character, user need to be inform
        # if self._global_arg["disable_character"]:
        #     # Not Found
        #     self.set_status(404)
        #     self.send_error(404)
        #     raise tornado.web.Finish()

        self.render('character.html', **self._global_arg)


class CharacterViewHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    @tornado.web.authenticated
    def get(self):
        if not self.is_permission_admin() and self._global_arg["disable_user_character"] or \
                self._global_arg["disable_character"]:
            # Not Found
            self.set_status(404)
            self.send_error(404)
            raise tornado.web.Finish()

        # validate argument
        is_admin = self.request.query == "is_admin"
        # user_id = self.request.query[len("user_id="):]
        # if user_id == "" and not is_admin:
        #     # Forbidden
        #     self.set_status(403)
        #     self.send_error(403)
        #     raise tornado.web.Finish()

        # validate permission and send result
        if is_admin:
            if self.is_permission_admin():
                data = json.dumps(self._db.get_all_user())
            else:
                print("Insufficient permissions from %s" % self.request.remote_ip, file=sys.stderr)
                # Forbidden
                self.set_status(403)
                self.send_error(403)
                raise tornado.web.Finish()
        else:
            user_id = self.current_user.get("user_id", "")
            if not user_id:
                print("Insufficient permissions from %s" % self.request.remote_ip, file=sys.stderr)
                # Forbidden
                self.set_status(403)
                self.send_error(403)
                raise tornado.web.Finish()

            data = json.dumps(self._db.get_all_user(user_id=user_id))

        self.write(data)
        self.finish()

    @tornado.web.asynchronous
    def post(self):
        if self._global_arg["disable_character"]:
            # Not Found
            self.set_status(404)
            self.send_error(404)
            raise tornado.web.Finish()
        self.prepare_json()

        user = self.get_argument("player")
        character = self.get_argument("character")
        delete_user_by_id = self.get_argument("delete_user_by_id")
        delete_character_by_id = self.get_argument("delete_character_by_id")

        # exception, if delete_user_by_id, create user if not exist
        if not user and delete_user_by_id:
            user = {"user_id": delete_user_by_id}

        self._db.update_user(user, character, delete_user_by_id=delete_user_by_id,
                             delete_character_by_id=delete_character_by_id)


class ManualHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    def get(self):
        self.write(self._manual.get_str_all())
        self.finish()


class LoreHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    def get(self):
        self.write(self._lore.get_str_all())
        self.finish()


class CharRuleHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    def get(self):
        str_value = self._char_rule.get_str_all(is_admin=False)
        self.write(str_value)
        self.finish()


class CharRuleAdminHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    def get(self):
        if self.is_permission_admin():
            str_value = self._char_rule.get_str_all(is_admin=True)
        else:
            print("Insufficient permissions from %s" % self.request.remote_ip, file=sys.stderr)
            # Forbidden
            self.set_status(403)
            self.send_error(403)
            raise tornado.web.Finish()
        self.write(str_value)
        self.finish()


class ProfileCmdUpdatePasswordHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    def post(self):
        if self._global_arg["disable_login"]:
            # Not Found
            self.set_status(404)
            self.send_error(404)
            raise tornado.web.Finish()

        # Be sure the user is connected
        current_user = self.get_current_user()
        if not current_user:
            print("Cannot send user command if not connect. %s" % self.request.remote_ip, file=sys.stderr)
            # Forbidden
            self.set_status(403)
            self.send_error(403)
            raise tornado.web.Finish()
        self.prepare_json()

        # Validate password is not empty
        old_password = self.get_argument("old_password")
        new_password = self.get_argument("new_password")
        if not old_password or not new_password:
            print("Password is empty from %s" % self.request.remote_ip, file=sys.stderr)
            data = {"error": "Password is empty."}
            self.write(data)
            self.finish()
            return

        # Validate old_password is good before update with the new_password
        success_password = self._db.compare_password(old_password, self.current_user.get("password"))
        if not success_password:
            print("Wrong password from ip %s." % self.request.remote_ip)
            data = {"error": "Wrong password."}
            self.write(data)
            self.finish()
            return

        # Validate the password is a new one
        success_password = self._db.compare_password(new_password, self.current_user.get("password"))
        if success_password:
            print("Same password from ip %s." % self.request.remote_ip)
            data = {"status": "Same password."}
            self.write(data)
            self.finish()
            return

        # Update password
        current_user["password"] = self._db.generate_password(new_password)
        self._db.update_user(current_user)

        # TODO Need to validate insertion
        data = {"status": "Password updated."}
        self.write(data)
        self.finish()


class ProfileCmdAddNewPasswordHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    def post(self):
        if self._global_arg["disable_login"]:
            # Not Found
            self.set_status(404)
            self.send_error(404)
            raise tornado.web.Finish()

        # Be sure the user is connected
        current_user = self.get_current_user()
        if not current_user:
            print("Cannot send user command if not connect. %s" % self.request.remote_ip, file=sys.stderr)
            # Forbidden
            self.set_status(403)
            self.send_error(403)
            raise tornado.web.Finish()

        # Validate if can add a new password
        if current_user["password"]:
            # Already contain a password
            print("User password is not empty from %s" % self.request.remote_ip, file=sys.stderr)
            data = {"error": "User password is not empty."}
            self.write(data)
            self.finish()
            return

        self.prepare_json()

        # Validate password is not empty
        password = self.get_argument("password")
        if not password:
            print("Password is empty from %s" % self.request.remote_ip, file=sys.stderr)
            data = {"error": "Password is empty."}
            self.write(data)
            self.finish()
            return

        # Update password
        updated_password = self._db.generate_password(password)
        self._db.add_missing_info_user(current_user, password=updated_password)

        # TODO Need to validate insertion
        data = {"status": "Password added."}
        self.write(data)
        self.finish()


class ProfileCmdInfoHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    @tornado.web.authenticated
    def get(self):
        # TODO not sure it's secure
        user = self.current_user
        return_user = {
            "email": user.get("email"),
            "username": user.get("username"),
            "name": user.get("name"),
            "given_name": user.get("given_name"),
            "family_name": user.get("family_name"),
            "verified_email": user.get("verified_email"),
            "locale": user.get("locale"),
            "password": bool(user.get("password")),
            "user_id": user.get("user_id"),
            "google_id": bool(user.get("google_id")),
            "facebook_id": bool(user.get("facebook_id")),
            "twitter_id": bool(user.get("twitter_id")),
            "permission": user.get("permission"),
            "postal_code": user.get("postal_code"),
        }
        self.write(return_user)
        self.finish()


class EditorCmdInfoHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    @tornado.web.authenticated
    def get(self):
        if not self.is_permission_admin():
            print("Insufficient permissions from %s" % self.request.remote_ip, file=sys.stderr)
            # Forbidden
            self.set_status(403)
            self.send_error(403)
            raise tornado.web.Finish()

        current_user = self.get_current_user()

        # Do get_instance first
        doc_generator = self._doc_generator_gspread.get_instance()

        # Fetch information
        if doc_generator:
            has_access_perm = doc_generator.check_has_permission()
            has_user_writer_perm = doc_generator.has_user_write_permission(current_user.get("email"))
        else:
            has_user_writer_perm = False
            has_access_perm = False

        file_url = self._doc_generator_gspread.get_url()
        email_google_service = self._doc_generator_gspread.get_email_service()
        is_auth = self._doc_generator_gspread.is_auth()
        can_generate = bool(doc_generator and has_access_perm and is_auth)

        info = {
            "file_url": file_url,
            "is_auth": is_auth,
            "user_has_writer_perm": has_user_writer_perm,
            "has_access_perm": has_access_perm,
            "email_google_service": email_google_service,
            "can_generate": can_generate
        }

        if self._doc_generator_gspread.has_error():
            error = self._doc_generator_gspread.get_error()
            info["error"] = error

        self.write(info)
        self.finish()


class EditorCmdAddGeneratorShareHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    @tornado.web.authenticated
    def post(self):
        if not self.is_permission_admin():
            print("Insufficient permissions from %s" % self.request.remote_ip, file=sys.stderr)
            # Forbidden
            self.set_status(403)
            self.send_error(403)
            raise tornado.web.Finish()

        current_user = self.get_current_user()

        doc_generator = self._doc_generator_gspread.get_instance()
        if not doc_generator:
            status = self._doc_generator_gspread.get_error()
            self.write(status)
            self.finish()
            return

        email = current_user.get("email")
        has_writer_perm = doc_generator.has_user_write_permission(email)
        if not has_writer_perm:
            status = doc_generator.share_document(current_user.get("email"))

            if status:
                data = {"status": "Document shared."}
            else:
                data = {"error": "Cannot share the document."}
        else:
            data = {"status": "Document already shared to user %s." % email}

        self.write(data)
        self.finish()


class EditorCmdUpdateFileUrlHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    @tornado.web.authenticated
    def post(self):
        if not self.is_permission_admin():
            print("Insufficient permissions from %s" % self.request.remote_ip, file=sys.stderr)
            # Forbidden
            self.set_status(403)
            self.send_error(403)
            raise tornado.web.Finish()

        self.prepare_json()

        file_url = self.get_argument("file_url")
        if not file_url:
            status = {"error": "The url is empty."}
            self.write(status)
            self.finish()
            return

        # Validate is not the same link
        actual_file_url = self._doc_generator_gspread.get_url()
        if actual_file_url == file_url:
            status = {"error": "The url is already open."}
            self.write(status)
            self.finish()
            return

        # Update and save the new link
        if self._doc_generator_gspread.connect():
            self._doc_generator_gspread.update_url(url=file_url, save=True)

        # Return data
        if self._doc_generator_gspread.has_error():
            data = self._doc_generator_gspread.get_error()
        else:
            data = {"status": "Document url is updated."}

        self.write(data)
        self.finish()


class EditorCmdGenerateAndSaveHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    @tornado.web.authenticated
    def post(self):
        if not self.is_permission_admin():
            print("Insufficient permissions from %s" % self.request.remote_ip, file=sys.stderr)
            # Forbidden
            self.set_status(403)
            self.send_error(403)
            raise tornado.web.Finish()

        # Generate the document. An error is returned if status is not True
        doc_generator = self._doc_generator_gspread.get_instance()
        if not doc_generator:
            status = self._doc_generator_gspread.get_error()
            self.write(status)
            self.finish()
            return
        status = doc_generator.generate_doc()
        if status:
            document = doc_generator.get_generated_doc()
            if "manual" in document:
                doc_part = document.get("manual")
                self._manual.update({"manual": doc_part}, save=True)
            if "lore" in document:
                doc_part = document.get("lore")
                self._lore.update({"lore": doc_part}, save=True)
            if "schema_user" in document or "schema_char" in document or "form_user" in document \
                    or "form_char" in document or "admin_form_user" in document or "admin_form_char" in document:
                dct_char_rule = {}
                if "schema_user" in document:
                    doc_part = document.get("schema_user")
                    dct_char_rule["schema_user"] = doc_part
                if "schema_char" in document:
                    doc_part = document.get("schema_char")
                    dct_char_rule["schema_char"] = doc_part
                if "form_user" in document:
                    doc_part = document.get("form_user")
                    dct_char_rule["form_user"] = doc_part
                if "form_char" in document:
                    doc_part = document.get("form_char")
                    dct_char_rule["form_char"] = doc_part
                if "admin_form_user" in document:
                    doc_part = document.get("admin_form_user")
                    dct_char_rule["admin_form_user"] = doc_part
                if "admin_form_char" in document:
                    doc_part = document.get("admin_form_char")
                    dct_char_rule["admin_form_char"] = doc_part

                self._char_rule.update({"char_rule": dct_char_rule}, save=True)
            status = {"status": "Generated with success. Database updated."}
        else:
            status = doc_generator.get_error(force_error=True)

        self.write(status)
        self.finish()


class StatSeasonPass(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    def get(self):
        self.write(self._db.stat_get_total_season_pass())
        self.finish()


class ValidateAuthHandler(base_handler.BaseHandler):
    """This class is designed purely for client-side validation"""

    @tornado.web.asynchronous
    def get(self):
        username = self.get_argument("username", default=None)

        # Validate username
        if username:
            if "@" in username:
                self.write("0")
                self.finish()
                return

        email = self.get_argument("email", default=None)
        if email:
            email = email.lower()

        print("Request validate auth from %s. Username %s email %s" % (self.request.remote_ip, username, email))

        # TODO return a json instead of a string number
        if username:
            self.write("0" if (self._db.user_exist(username=username) or self._db.user_exist(email=username)) else "1")
        elif email:
            self.write("0" if (self._db.user_exist(email=email) or self._db.user_exist(username=email)) else "1")
        else:
            # Bad Request
            # TODO need to test this line with a unittest
            # self.get_argument("username or email")
            self.set_status(400)
            self.send_error(400)
            raise tornado.web.Finish()
        self.finish()


class SettingArchiveGenerateProjectHandler(base_handler.BaseHandler):
    """This class generate an archive of this project repository."""

    @tornado.web.authenticated
    def get(self):
        if not self.is_permission_admin():
            print("Insufficient permissions from %s" % self.request.remote_ip, file=sys.stderr)
            # Forbidden
            self.set_status(403)
            self.send_error(403)
            raise tornado.web.Finish()

        # Create header
        file_name = "gestion_personnage_tl_archive_%s.zip" % datetime.datetime.now().strftime("%Y_%m_%d-%H_%M_%S")
        self.set_header('Content-Type', 'application/octet-stream')
        self.set_header('Content-Disposition', 'attachment; filename=' + file_name)

        # Generate archive project
        data = self._project_archive.generate_archive()
        self.write(data)
        self.finish()
