Installation Guide
==================
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
We use bower-installer to update and install javascript code.
After, execute bower-install to install static dependence.

**No need bower if you execute server with argument --use_internet_static**
Because this option will get dependency on internet directly.

```{r, engine='bash', count_lines}
sudo npm install -g bower-installer
cd src/web; bower-installer
```

Bug Tornado
===========
Tornado Userapp module has a bug with new version of tornado. Since the problem
will be fix, use a fork with the fix.

Clone the git repo where you want :
```{r, engine='bash', count_lines}
git clone https://github.com/mathben/userapp-tornado.git
```

When launching the server, add python path to this clone.
Update the PYTHONPATH argument.
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
