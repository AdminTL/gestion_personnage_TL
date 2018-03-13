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
# A possible improvement would be to set the number of requests as an argument
# in the Python script, so we would be able to use aliases (Let's Encrypt sends
# one request per domain alias). Right now aliases are not supported (this is
# just a helper script for what is already a simple client!).

ACTUAL_PATH="$(dirname "$(readlink -f "$0")")"

mkdir -p ${ACTUAL_PATH}/../ssl_cert/acme-challenge

# "Accept" LetsEncrypt terms to create an account automatically
echo "Attempting to register the account."
${ACTUAL_PATH}/../third-party/dehydrated/dehydrated --register --accept-terms

# Register the actual certificate
echo "Attempting to obtain the cert."
${ACTUAL_PATH}/../third-party/dehydrated/dehydrated -c --config ${ACTUAL_PATH}/../ssl_cert/config

echo "All done!"
echo "If you would like to reset the process any reason, delete autossl/dehydrated/certs and autossl/dehydrated/account."
echo "Otherwise, you can just run the same command again to renew the cert."
echo "The paths are relative, so if you use a cron to renew, you'll need to use cd:"
echo "    @weekly cd /somepath/gestion_personnage_TL && ./justletsencrypt && cd -"
