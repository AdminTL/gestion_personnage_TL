import tornado
import tornado.web
import tornado.auth
import base_handler
import jsonhandler
import sys


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
        can_generate = bool(doc_generator and
                            not self._doc_generator_gspread.has_error() and
                            not doc_generator.has_error() and
                            has_access_perm and is_auth
                            )

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
            status = {"status": "Generated with success. Database updated."}
        else:
            status = doc_generator.get_error(force_error=True)

        self.write(status)
        self.finish()
