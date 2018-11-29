Installation Guide
==================
Submodule
---------
To initial third-party, you need to update submodule.
```{r, engine='bash'}
git submodule update --init
```

Download
--------
You can clone the project with git
```{r, engine='bash', count_lines}
git clone https://github.com/AdminTL/gestion_personnage_TL.git
```

Or download it from here : https://github.com/AdminTL/gestion_personnage_TL/archive/master.zip

Dependencies
------------
You need python3.5

Arch Linux
------
```{r, engine='bash', count_lines}
sudo pacman -S python python-pip
sudo pip install tornado sockjs-tornado tinydb bcrypt PyOpenSSL oauth2client gspread pynpm
```

Mac OSX
-------
```{r, engine='bash', count_lines}
brew install python3
sudo pip3 install tornado sockjs-tornado tinydb bcrypt PyOpenSSL oauth2client gspread pynpm
```

Ubuntu / Debian
---------------
```{r, engine='bash', count_lines}
sudo apt-get install python3 python3-pip
sudo pip3 install tornado sockjs-tornado tinydb bcrypt PyOpenSSL oauth2client gspread pynpm
```

If you have problem with oauth2client, maybe you need to update pyasn.
```{r, engine='bash', count_lines}
sudo apt-get --reinstall install python-pyasn1 python-pyasn1-modules
```
or
```{r, engine='bash', count_lines}
sudo pip3 install --upgrade google-auth-oauthlib
```

You need to install NPM and Angular CLI
```{r, engine='bash', count_lines}
npm install -g @angular/cli
```

Windows
-------
Install python 3 from https://www.python.org/downloads/ using the installer
Install nodejs if not done already https://nodejs.org/en/download/
Start a cmd prompt with admin privileges by right-clicking->run as administrator (git-bash works well)
```
pip3 install tornado sockjs-tornado tinydb PyOpenSSL oauth2client gspread pynpm
```

Authentication
==============
To disable authentication, use argument --disable_login

Running
=======
#####Compiling Angular code
In the `{project_root}/src/client_web/` directory, run `npm run build`

#####Running
Once compiling is done, run `{project_root}/script/web_server.sh` to launch the server.
Alternatively, you can run `py {project_root}/src/server_web/__main__.py`

Configure server
================
On production server, you need to specify your host and port. Run instance with argument :
```
-l HOST:PORT
```
When using http, use port 80.

When using https, use port 443.

When using http with https "--redirect_http_to_https", use port 80.

SSL
---
To enable https, you can generate a certificate ssl.
1. Edit your domain in file ssl_cert/domains.txt
1. Adapt the configuration file ssl_cert/config
1. On config, set your email address
1. On config, enable CA=... with staging address to test the script.
1. And execute : 
```
./script/justletsencrypt.sh
```

Systemctl
---------
You can setup the daemon with Systemctl.

```
cp ./script/gestion_personnage.service /etc/systemd/system/gestion_personnage.service
```

And edit the file on destination with argument you need.

Options
-------
```
--debug : Enable debug (default=False)
--open_browser : Open web browser on tabulation on server start (default=False)
--template_dir : Web: Template files directory (default=WEB_DEFAULT_TEMPLATE_DIR)
--db_path : Specify a path for database file. (default=DB_DEFAULT_PATH)
--db_demo : Use demo database. This option keeps all information in memory and does not save to the real database. (default=False)
--web-listen-address : Web: Web server listen address (default=Listen())
--ssl : Activate https and create ssl files if they don't exist. Doesn't work in Windows. (default=False)
--redirect_http_to_https : when you need to support external link with http, this will redirect request to https.
--use_internet_static : Not implemented. Force using static files like css and js from another internet website. Use web browser cache. (default=False)
--disable_login : Disable authentication
--disable_character : Disable access to character
--disable_user_character : Disable access to user of our character
```
