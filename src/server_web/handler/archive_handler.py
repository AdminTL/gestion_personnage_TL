import tornado
import tornado.web
import tornado.auth
import base_handler
import jsonhandler
import datetime
import sys


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
