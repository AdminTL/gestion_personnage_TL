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
            raise tornado.web.Finish()

        # check file exist
        files = os.listdir(path_acme_challenge)
        if not files:
            print("Error, no files in path %s" % path_acme_challenge, file=sys.stderr)
            # Not found
            self.set_status(404)
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
        if self.get_secure_cookie("user"):
            self.redirect("/")
            return

        self.render('login.html', **self._global_arg)

    @tornado.web.asynchronous
    def post(self):
        if self._global_arg["disable_login"]:
            self.redirect("/login?invalid=disable_login")

        if self.get_secure_cookie("user"):
            print("Need to logout before login or sign up from %s" % self.request.remote_ip, file=sys.stderr)
            # Bad request
            self.set_status(400)
            raise tornado.web.Finish()

        # EXTREMELY IMPORTANT to prevent accessing accounts that do not yet have a password.
        password = self.get_argument("password")
        if not password:
            print("Password is empty from %s" % self.request.remote_ip, file=sys.stderr)
            self.redirect("/login?invalid=password")
            return

        # Login
        if self.get_argument("username_or_email", ""):

            username_or_email = self.get_argument("username_or_email", "")
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
                user = self._db.get_user(name=username_or_email, password=password)

            # If user is found, give him a secure cookie based on his user id
            if user:
                self.give_cookie(user.get("user_id"))
            else:
                print("Invalid email/password combination from %s" % self.request.remote_ip, file=sys.stderr)
                self.redirect("/login?invalid=login")
                return

        # Sign Up
        elif self.get_argument("username"):
            name = self.get_argument("username")
            if not name:
                print("Username is empty from %s" % self.request.remote_ip, file=sys.stderr)
                self.redirect("/login?invalid=username")
                return

            email = self.get_argument("email", default=None)

            password_mail = self.get_argument("pwconfirm")
            if not password_mail:
                print("Password is empty from %s" % self.request.remote_ip, file=sys.stderr)
                self.redirect("/login?invalid=password")
                return

            if self._db.create_user(name, email, password, password_mail):
                self.redirect("/login")
                return
            else:
                self.redirect("/login?invalid=signup")
                return


class GoogleOAuth2LoginHandler(base_handler.BaseHandler, tornado.auth.GoogleOAuth2Mixin):
    @tornado.gen.coroutine
    def get(self):
        try:
            if self.get_argument('code', False):
                google_user = yield self.get_authenticated_user(
                    redirect_uri=self._global_arg["url"] + '/cmd/auth/google',
                    code=self.get_argument('code'))
                access_token = google_user["access_token"]
                google_user = yield self.oauth2_request("https://www.googleapis.com/oauth2/v1/userinfo",
                                                        access_token=access_token)

                # Save the user with e.g. set_secure_cookie
                google_id = google_user["id"]
                user = self._db.get_user(id_type="google", user_id=google_id)

                # Login
                # If user is found, give him a secure cookie based on his user_id and Google access_token
                if user:
                    self.give_cookie(user.get("user_id"), google_access_token=access_token)

                # Sign up
                else:
                    name = google_user["name"]
                    email = google_user.get("email")

                    # check if email exist or name. If yes, associate it with this account
                    if self._db.user_exist(email=email):
                        # use this email to associate
                        user = self._db.get_user(email=email, force_email_no_password=True)
                        if user:
                            user["google_id"] = google_id
                            self._db.update_user(user)
                    else:
                        user = self._db.create_user(name, email, google_id=google_id)

                    if user:
                        self.give_cookie(user.get("user_id"), google_access_token=access_token)
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
                access_token = facebook_user["access_token"]

                facebook_id = facebook_user["id"]
                user = self._db.get_user(id_type="facebook", user_id=facebook_id)

                # Login
                # If user is found, give him a secure cookie based on his user_id and Facebook access_token
                if user:
                    self.give_cookie(user.get("user_id"), facebook_access_token=access_token)

                # Sign up
                else:
                    name = facebook_user["name"]
                    email = facebook_user.get("email")
                    # check if email exist or name. If yes, associate it with this account
                    if self._db.user_exist(email=email):
                        # use this email to associate
                        user = self._db.get_user(email=email, force_email_no_password=True)
                        if user:
                            user["facebook_id"] = facebook_id
                            self._db.update_user(user)
                    else:
                        user = self._db.create_user(name, email, facebook_id=facebook_id)

                    if user:
                        self.give_cookie(user.get("user_id"), facebook_access_token=access_token)
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
                access_token = twitter_user.get("access_token")
                twitter_user = yield self.twitter_request("/account/verify_credentials",
                                                          access_token=access_token, include_email="true")

                twitter_id = twitter_user["id_str"]
                user = self._db.get_user(id_type="twitter", user_id=twitter_id)

                # Login
                # If user is found, give him a secure cookie based on his user_id and Twitter access_token
                if user:
                    self.give_cookie(user.get("user_id"), twitter_access_token=access_token)

                # Sign up
                else:
                    # nickname = twitter_user["screen_name"]
                    name = twitter_user["name"]
                    email = twitter_user.get("email")

                    # check if email exist or name. If yes, associate it with this account
                    if self._db.user_exist(email=email):
                        # use this email to associate
                        user = self._db.get_user(email=email, force_email_no_password=True)
                        if user:
                            user["twitter_id"] = twitter_id
                            self._db.update_user(user)
                    else:
                        user = self._db.create_user(name, email, twitter_id=twitter_id)

                    if user:
                        self.give_cookie(user.get("user_id"), twitter_access_token=access_token)
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
        if self._global_arg["disable_admin"]:
            # Not Found
            self.set_status(404)
            raise tornado.web.Finish()
        if self.current_user.get("permission") == "Admin":
            self.render('admin_character.html', **self._global_arg)
        else:
            print("Insufficient permissions from %s" % self.request.remote_ip, file=sys.stderr)
            # Forbidden
            self.set_status(403)
            raise tornado.web.Finish()


class ProfileHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    @tornado.web.authenticated
    def get(self, user_id=None):
        if self._global_arg["disable_character"]:
            # Not Found
            self.set_status(404)
            raise tornado.web.Finish()
        if user_id:
            user = self._db.get_user(user_id=user_id)
        else:
            user = self.current_user
        self.render('profile.html', user=user, **self._global_arg)


class CharacterHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        if self._global_arg["disable_character"]:
            # Not Found
            self.set_status(404)
            raise tornado.web.Finish()

        self.render('character.html', **self._global_arg)


class CharacterViewHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    def get(self):
        if self._global_arg["disable_character"]:
            # Not Found
            self.set_status(404)
            raise tornado.web.Finish()

        user_id = self.request.query[len("user_id="):]
        is_admin = self.request.query == "is_admin"
        if user_id == "" and not is_admin:
            # Forbidden
            self.set_status(403)
            raise tornado.web.Finish()

        # TODO manage what we get and user management permission
        if is_admin:
            data = json.dumps(self._db.get_all_user())
        else:
            data = json.dumps(self._db.get_all_user(user_id=user_id))

        self.write(data)
        self.finish()

    @tornado.web.asynchronous
    def post(self):
        if self._global_arg["disable_character"]:
            # Not Found
            self.set_status(404)
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


class StatSeasonPass(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    def get(self):
        self.write(self._db.stat_get_total_season_pass())
        self.finish()


class ValidateAuthHandler(base_handler.BaseHandler):
    """This class is designed purely for client-side validation"""

    @tornado.web.asynchronous
    def get(self):
        name = self.get_argument("username", default=None)
        email = self.get_argument("email", default=None)
        print("Request validate auth from %s. Name %s email %s" % (self.request.remote_ip, name, email))

        # TODO return a json instead of a string number
        if name:
            self.write("0" if (self._db.user_exist(name=name) or self._db.user_exist(email=name)) else "1")
        elif email:
            self.write("0" if (self._db.user_exist(email=email) or self._db.user_exist(name=email)) else "1")
        else:
            # Bad Request
            # TODO need to test this line with a unittest
            # self.get_argument("username or email")
            self.set_status(400)
            raise tornado.web.Finish()
        self.finish()
