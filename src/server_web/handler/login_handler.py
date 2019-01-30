import tornado
import tornado.web
import tornado.auth
import base_handler
import jsonhandler
import sys


class LoginHandler(base_handler.BaseHandler):
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

            elif "error" in self.request.arguments.keys():
                print("Receive error : " % self.request.arguments)
                self.redirect("/login?invalid=facebook")
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


class UserAuthenticate(jsonhandler.JsonHandler):
    """This class is designed purely for client-side validation"""

    def post(self):
        self.prepare_json()

        username = self.get_argument("username")
        password = self.get_argument("password")
        has_error = False

        user = self._db.get_user(username=username, password=password)
        if user:
            self.give_cookie(user.get("user_id"))
        else:
            has_error = True

        # Validation
        if has_error:
            msg = "User authentication invalid email/password"
            msg_debug = msg + " combination from %s" % self.request.remote_ip
            print(msg_debug, file=sys.stderr)
            self.set_status(400)
            self.send_error(400, message=msg)
            raise tornado.web.Finish()

        # self.redirect("/")
        # self.set_status(200)
        # self.finish()


class UserRegister(jsonhandler.JsonHandler):
    """This class is designed purely for client-side validation"""

    def post(self):
        self.prepare_json()

        username = self.get_argument("username")
        password = self.get_argument("password")
        email = self.get_argument("email")
        first_name = self.get_argument("firstName")
        last_name = self.get_argument("lastName")
        has_error = False

        # TODO validate password
        if not username:
            has_error = True
            msg = "Username is empty."
        elif not password:
            has_error = True
            msg = "Password is empty."
        elif self._db.user_exist(username=username):
            has_error = True
            msg = "User %s already exist, choose another username." % username
        else:
            # New user
            user = self._db.create_user(username, password=password, name=first_name, given_name=first_name,
                                        family_name=last_name, email=email)

            if user:
                self.give_cookie(user.get("user_id"))
            else:
                has_error = True
                msg = "Internal server error, cannot create user."

        # Validation
        if has_error:
            msg_debug = msg + " from %s" % self.request.remote_ip
            print(msg_debug, file=sys.stderr)
            self.set_status(400)
            self.send_error(400, message=msg)
            raise tornado.web.Finish()

        # self.redirect("/")
        # self.set_status(200)
        # self.finish()


class User(base_handler.BaseHandler):
    """This class is designed purely for client-side validation"""

    def get(self):
        current_user = self.get_current_user()
        if current_user:
            current_user["is_admin"] = self.is_permission_admin()
            obj = {"body": current_user}
            self.set_status(200)
        else:
            # obj = {"body": {"user_id": ""}}
            obj = {"message": 'Unauthorised'}
            # TODO why the client crash and restart when send status 401?
            # self.set_status(401)
        self.set_status(200)

        self.write(obj)

        # user = {"id": 123, "username": "1234567890", "firstName": "123", "lastName": "123", "token": "fake"}
        # obj = {"body": user}
        # self.set_status(200)
        # self.write(obj)
        self.finish()


class UserLogout(base_handler.BaseHandler):
    """This class is designed purely for client-side validation"""

    def get(self):
        self.clear_cookie("user")
        self.set_status(200)
        self.finish()
