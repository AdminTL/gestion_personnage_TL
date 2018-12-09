import tornado
import tornado.web
import tornado.auth
import base_handler
import jsonhandler

ENABLE_FACEBOOK_FEED = False


class IndexHandler(base_handler.BaseHandler):
    @tornado.web.asynchronous
    def get(self):
        # TODO mettre un lock ici pendant qu'on relance la compilation avec npm.
        #  Le lock va durer le moment qu'on switch de répertoire
        # Regarder pour mettre un lien symbolic vers le répertoire à compiler
        self.render('index.html', enable_facebook_feed=ENABLE_FACEBOOK_FEED, **self._global_arg)


class StatSeasonPass(jsonhandler.JsonHandler):
    @tornado.web.asynchronous
    def get(self):
        self.write(self._db.stat_get_total_season_pass())
        self.finish()
