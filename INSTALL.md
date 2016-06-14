Installation Guide
==================
Download
--------
You can clone the project with git
```{r, engine='bash', count_lines}
git clone https://github.com/AdminTL/gestion_personnage_TL.git
```

Or download it from here : https://github.com/AdminTL/gestion_personnage_TL/archive/master.zip

Dependence
----------
You need python3, python3-tornado and python3-sockjs-tornado

Arch Linux
------
```{r, engine='bash', count_lines}
sudo pacman -S python python-pip
sudo pip install tornado sockjs-tornado tinydb
sudo pip install userapp.tornado --pre
```

Mac OSX
-------
```{r, engine='bash', count_lines}
brew install python3
sudo pip3 install tornado sockjs-tornado tinydb
sudo pip3 install userapp.tornado --pre
```

Ubuntu
------
```{r, engine='bash', count_lines}
sudo apt-get install python3 python3-pip
sudo pip3 install tornado sockjs-tornado tinydb
sudo pip3 install userapp.tornado --pre
```

Windows
-------
Install python 3 from https://www.python.org/downloads/ using the installer
Install nodejs if not done already https://nodejs.org/en/download/
Start a cmd prompt with admin privileges by right-clicking->run as administrator (git-bash works well)
```
pip3 install tornado sockjs-tornado tinydb
pip3 install userapp.tornado --pre
```

Bower
=====
We use bower to update and install javascript code.
Only need in develop or server without Internet.

**No need bower if you execute server with argument --use_internet_static**
Because this option will get dependency on Internet directly.

You need to install bower and execute the next command :
```{r, engine='bash', count_lines}
cd src/web; bower install
```

Choose first option if bower ask to resolve conflict.

Bug Tornado
===========
**TypeError: function() argument 1 must be code, not str**

Tornado Userapp module has a bug with new version of tornado. Since the problem
will be fix, use a fork with the fix.

Clone the git repo where you want :
```{r, engine='bash', count_lines}
git clone https://github.com/mathben/userapp-tornado.git
```

When launching the server, add python path to this clone.
Update the PYTHONPATH argument. Create an environment variable in your IDE if it is not already present.
```{r, engine='bash', count_lines}
PYTHONPATH=~/git/userapp-tornado ./web_server.sh
```

UserApp
=======
UserApp need a "userapp id" to identify your account.
You need to change in server and client side the id.

On server side, files /src/web/handlers.py
```{r, engine='python', count_lines}
USER_APP_ID = "YOU_USER_APP_ID"
```

On client side, files /src/web/static/local/js/tl_ctrl.js
```{r, engine='python', count_lines}
user.init({appId: "YOU_USER_APP_ID"});
```

Running
=======
Run __main__.py to launch the server.

Options
-------
```
--debug : Enable debug (default=False)
--open_browser : Open web browser on tabulation when start server (default=False)
--static_dir : Web: Static files directory (default=WEB_DEFAULT_STATIC_DIR)
--template_dir : Web: Template files directory (default=WEB_DEFAULT_TEMPLATE_DIR)
--db_path : Specify a path for database file. (default=DB_DEFAULT_PATH)
--db_demo : Active demo database. Cannot save information in real database, only keep in memory. (default=False)
--web-listen-address : Web: Web server listen address (default=Listen())
--ssl : Active https and create ssl files if not exist. Not work in windows. (default=False)
--use_internet_static : Force use to use static files like css and js from another internet website. Use web browser cache. (default=False)
```