import tornado
import tornado.web
import tornado.auth
import base_handler
import jsonhandler
import sys


class EditorCmdInfoHandler(jsonhandler.JsonHandler):
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
        try:
            doc_generator = self._doc_generator_gspread.get_instance()
        except Exception as e:
            print(e, file=sys.stderr)
            self.send_error(500, msg=str(e))
            raise tornado.web.Finish()

        # Fetch information
        if doc_generator:
            try:
                has_access_perm = doc_generator.check_has_permission()
                has_user_writer_perm = doc_generator.has_user_write_permission(current_user.get("email"))
            except Exception as e:
                print(e, file=sys.stderr)
                self.send_error(500, msg=str(e))
                raise tornado.web.Finish()
        else:
            has_user_writer_perm = False
            has_access_perm = False

        file_url = self._doc_generator_gspread.get_url()
        email_google_service = self._doc_generator_gspread.get_email_service()
        is_auth = self._doc_generator_gspread.is_auth()
        can_generate = bool(doc_generator and has_access_perm and is_auth)
        last_updated_date = self._model.get_last_date_updated()
        last_updated_date_for_js = last_updated_date * 1000

        info = {
            "fileURL": file_url,
            "isAuth": is_auth,
            "userHasWriterPerm": has_user_writer_perm,
            "hasAccessPerm": has_access_perm,
            "emailGoogleService": email_google_service,
            "canGenerate": can_generate,
            "lastLocalDocUpdate": last_updated_date_for_js
        }

        if self._doc_generator_gspread.has_error():
            error = self._doc_generator_gspread.get_error()
            info["error"] = error

        self.write(info)
        self.finish()


class EditorCmdAddGeneratorShareHandler(jsonhandler.JsonHandler):
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
                msg = "Cannot share the document."
                print(msg, file=sys.stderr)
                self.send_error(500, msg=msg)
                raise tornado.web.Finish()
        else:
            data = {"status": "Document already shared to user %s." % email}

        self.write(data)
        self.finish()


class EditorCmdUpdateFileUrlHandler(jsonhandler.JsonHandler):
    @tornado.web.authenticated
    def post(self):
        if not self.is_permission_admin():
            print("Insufficient permissions from %s" % self.request.remote_ip, file=sys.stderr)
            msg = "Insufficient permission"
            # Forbidden
            self.set_status(403)
            self.send_error(403, msg=msg)
            raise tornado.web.Finish()

        self.prepare_json()

        file_url = self.get_argument("fileURL")
        if not file_url:
            msg = "The url is empty."
            print(msg, file=sys.stderr)
            self.send_error(500, msg=msg)
            raise tornado.web.Finish()

        # Validate is not the same link
        actual_file_url = self._doc_generator_gspread.get_url()
        if actual_file_url == file_url:
            msg = "The url is already open."
            print(msg, file=sys.stderr)
            self.send_error(500, msg=msg)
            raise tornado.web.Finish()

        # Update and save the new link
        try:
            if self._doc_generator_gspread.connect():
                self._doc_generator_gspread.update_url(url=file_url, save=True)
        except Exception as e:
            print(e, file=sys.stderr)
            self.send_error(500, msg=str(e))
            raise tornado.web.Finish()

        # Return data
        if self._doc_generator_gspread.has_error():
            data = self._doc_generator_gspread.get_error()
        else:
            data = {"status": "Document url is updated.", "fileURL": file_url}

        self.write(data)
        self.finish()


class EditorCmdGenerateAndSaveHandler(jsonhandler.JsonHandler):
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
            info = {}
            if "manual" in document:
                doc_part = document.get("manual")
                info["manual"] = doc_part
                # self._manual.update({"manual": doc_part}, save=True)
            if "lore" in document:
                doc_part = document.get("lore")
                info["lore"] = doc_part
                # self._manual.update({"lore": doc_part}, save=True)
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
                info["char_rule"] = dct_char_rule
            info["point"] = document["point"]
            info["skill_manual"] = document["skill_manual"]
            # Write to database
            self._model.update({"manual": info}, save=True)
            status = {"status": "Generated with success. Database updated."}
        else:
            status = doc_generator.get_error(force_error=True)

        self.write(status)
        self.finish()
