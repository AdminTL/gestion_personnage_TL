Installation Guide
==================
Download
--------
You can clone the project with git
```{r, engine='bash', count_lines}
git clone https://github.com/AdminTL/gestion_personnage_TL.git
```

Or download it from here : https://github.com/AdminTL/gestion_personnage_TL/archive/master.zip

Dependencies
------------
You need python3, python3-tornado and python3-sockjs-tornado

Arch Linux
------
```{r, engine='bash', count_lines}
sudo pacman -S python python-pip
sudo pip install tornado sockjs-tornado tinydb bcrypt
```

Mac OSX
-------
```{r, engine='bash', count_lines}
brew install python3
sudo pip3 install tornado sockjs-tornado tinydb bcrypt
```

Ubuntu / Debian
---------------
```{r, engine='bash', count_lines}
sudo apt-get install python3 python3-pip
sudo pip3 install tornado sockjs-tornado tinydb bcrypt
```

Windows
-------
Install python 3 from https://www.python.org/downloads/ using the installer
Install nodejs if not done already https://nodejs.org/en/download/
Start a cmd prompt with admin privileges by right-clicking->run as administrator (git-bash works well)
```
pip3 install tornado sockjs-tornado tinydb
```

Bower
=====
We use bower to update and install javascript code.
Only need in develop or server without Internet.

**You don't need bower if you execute the server with the --use_internet_static argument**
Because this option will get dependencies on Internet directly.

You need to [install bower](https://bower.io/#install-bower) and execute the install command :
```{r, engine='bash', count_lines}
cd src/web
bower install
```

Choose the first option if bower asks to resolve conflict.

Authentication
==============
To disable authentication, use argument --disable_login

Running
=======
Run ./web_server.sh to launch the server.

Configure server
================
On production server, you need to specify your host and port. Run instance with argument :
```
-l HOST:PORT
```

Options
-------
```
--debug : Enable debug (default=False)
--open_browser : Open web browser on tabulation on server start (default=False)
--static_dir : Web: Static files directory (default=WEB_DEFAULT_STATIC_DIR)
--template_dir : Web: Template files directory (default=WEB_DEFAULT_TEMPLATE_DIR)
--db_path : Specify a path for database file. (default=DB_DEFAULT_PATH)
--db_demo : Use demo database. This option keeps all information in memory and does not save to the real database. (default=False)
--web-listen-address : Web: Web server listen address (default=Listen())
--ssl : Activate https and create ssl files if they don't exist. Doesn't work in Windows. (default=False)
--use_internet_static : Not implemented. Force using static files like css and js from another internet website. Use web browser cache. (default=False)
--disable_login : Disable authentication
```
