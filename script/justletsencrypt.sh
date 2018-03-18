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

ACTUAL_PATH="$(dirname "$(readlink -f "$0")")"
CHALLENGE_PATH="${ACTUAL_PATH}/../ssl_cert/acme-challenge"

mkdir -p ${CHALLENGE_PATH}

# "Accept" LetsEncrypt terms to create an account automatically
echo "Attempting to register the account."
${ACTUAL_PATH}/../third-party/dehydrated/dehydrated --register --accept-terms
STATUS=$?
if [[ ${STATUS} -ne 0 ]]; then
    echo "Error to register and accept-terms."
    exit ${STATUS}
fi

# Register the actual certificate
echo "Attempting to obtain the cert."
${ACTUAL_PATH}/../third-party/dehydrated/dehydrated --accept-terms -c --config ${ACTUAL_PATH}/../ssl_cert/config
STATUS=$?
if [[ ${STATUS} -ne 0 ]]; then
    echo "Error to run config with path ${ACTUAL_PATH}/../ssl_cert/config."
    exit ${STATUS}
fi

rm -r ${CHALLENGE_PATH}

echo "All done!"
echo "If you would like to reset the process any reason, delete ssl_cert/certs, ssl_cert/chains and ssl_cert/account."
echo "Otherwise, you can just run the same command again to renew the cert."
echo "Example of cron to renew:"
echo "    @weekly cd /somepath/gestion_personnage_TL && ./script/justletsencrypt.sh && cd -"
