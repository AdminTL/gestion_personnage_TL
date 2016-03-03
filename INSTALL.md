Installation Guide
==================
Dependence
----------
You need python3, python3-tornado and python3-sockjs-tornado

Ubuntu
------
```{r, engine='bash', count_lines}
sudo apt-get install python3 python3-pip
sudo pip3 install tornado sockjs-tornado
sudo pip3 install userapp.tornado --pre
```

Mac OSX
-------
```{r, engine='bash', count_lines}
brew install python3
sudo pip3 install tornado sockjs-tornado
sudo pip3 install userapp.tornado --pre
```

Bower
-----
We use bower-installer to update and install javascript code.
After, execute bower-install to install static dependence.

```{r, engine='bash', count_lines}
sudo npm install -g bower-installer
cd src/web; bower-installer
```
