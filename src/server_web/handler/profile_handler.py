import tornado
import tornado.web
import tornado.auth
import base_handler
import jsonhandler
import sys


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
