#!/usr/bin/env bash

###                          Just Let's Encrypt!                            ###
# This script uses dehydrated (a very simple Let's Encrypt client) to create a
# Let's Encrypt SSL certificate using Tornado. Most of the relevant code is in 
# autossl.
#
# Before running this script, ping the domain name to make sure it points to 
# this server. Let's Encrypt checks ownership by checking a file on the server
# officially associated with the domain name. So if your domain name doesn't
# point here, this script (and dehydrated) will not work.
# 
# The configuration in autossl/dehydrated/config uses a relative path, so you
# can **only** use this script FROM THE gestion_personnage_TL DIRECTORY.
#
# The web server runs in the background and shuts down after a single request,
# so you don't have to manually kill it after this script runs. It will also
# shut down if it fails to bind to port 80. You usually need root to bind to
# port 80.
#
# If anything fails, you might need to kill the Tornado server manually:
#     ps aux |grep autossl
#     sudo kill [process id]
#
# A possible improvement would be to set the number of requests as an argument
# in the Python script, so we would be able to use aliases (Let's Encrypt sends
# one request per domain alias). Right now aliases are not supported (this is
# just a helper script for what is already a simple client!).

if [ $# -eq 0 ]
  then
  echo "You need to specify your domain name, like so:"
  echo "    ./justletsencrypt example.com"
  echo "You can specify aliases as well if need be:"
  echo "    ./justletsencrypt example.com www.example.com dev1.example.com"
  exit 1
fi

mkdir -p autossl/acme-challenge

# On a normal server, we need sudo to bind a web server to port 80
# The server is made to turn off after a single request
echo "Running the web server as a pseudo-daeomon. We need root to bind to port 80. Only port 80 is supported for the LetsEncrypt check."
sudo python3 autossl/__main__.py &

# "Accept" LetsEncrypt terms to create an account automatically
echo "Attempting to register the account."
autossl/dehydrated/dehydrated --register --accept-terms

# Register the actual certificate
echo "Attempting to obtain the cert."
autossl/dehydrated/dehydrated -c --domain "$1"


echo "All done!"
echo "If you would like to reset the process any reason, delete autossl/dehydrated/certs and autossl/dehydrated/account."
echo "Otherwise, you can just run the same command again to renew the cert."
echo "The paths are relative, so if you use a cron to renew, you'll need to use cd:"
echo "    @weekly cd /somepath/gestion_personnage_TL && ./justletsencrypt example.com && cd -"
