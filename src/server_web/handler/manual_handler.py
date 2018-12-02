import tornado
import tornado.web
import tornado.auth
import jsonhandler
import sys


class ManualHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    def get(self):
        str_value = self._manual.get_str_all(is_admin=False)
        self.write(str_value)
        self.finish()


class ManualAdminHandler(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    def get(self):
        if not self.is_permission_admin():
            print("Insufficient permissions from %s" % self.request.remote_ip, file=sys.stderr)
            # Forbidden
            self.set_status(403)
            self.send_error(403)
            raise tornado.web.Finish()
        str_value = self._manual.get_str_all(is_admin=True)
        self.write(str_value)
        self.finish()
