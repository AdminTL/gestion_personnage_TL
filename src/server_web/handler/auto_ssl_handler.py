import tornado
import tornado.web
import tornado.auth
import os
import sys


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
