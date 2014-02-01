#!/bin/bash

WORKSPACE=$1
PORT=$2

# Detect current platform
# We need this to customize configuration differently for OS X and Linux
platform="$(uname)"

# 2 byte random number in hexadecimal (0xffff)
RAND_ID=$(openssl rand 2 -hex)

# Folder to store our config and other stuff
FOLDER="/tmp/apache-${RAND_ID}"

# Name of conf file
CONF="apache2.conf"

# Platform specific apache extras
EXTRA_CONF=''
if [[ $platform == 'Linux' ]]; then
    EXTRA_CONF="
# Include module configuration:
Include /etc/apache2/mods-enabled/*.load
Include /etc/apache2/mods-enabled/*.conf
"
elif [[ $platform == 'Darwin' ]]; then
    EXTRA_CONF="
# Modules
$(cat /etc/apache2/httpd.conf | grep LoadModule | sed 's/libexec/\/usr\/libexec/g')
LoadModule php5_module /usr/libexec/apache2/libphp5.so
"
fi

# Create the necessary folders
mkdir -p ${FOLDER}
mkdir -p "${FOLDER}/logs"

# Generate the apache config
cat  <<EOF > "${FOLDER}/${CONF}"
ServerName localhost
Listen ${PORT}
PidFile ${FOLDER}/httpd.pid
LockFile ${FOLDER}/accept.lock

# Start only one server
StartServers 1
MinSpareServers 1
MaxSpareServers 1

# Serve our workspace
DocumentRoot "${WORKSPACE}"
<Directory />
  AllowOverride all
  Order allow,deny
  Allow from all
</Directory>

AddType application/x-httpd-php .php
DirectoryIndex index.html index.php

# Platform specific extra configuration
${EXTRA_CONF}

EOF

function cleanup {
    if [[ -f "${FOLDER}/http.pid" ]]; then
        echo "Killed process"
        kill -s KILL $(cat "${FOLDER}/http.pid")
    fi
    # Remove folder on exit
    echo "Cleaning up ${FOLDER}"
    rm -rf ${FOLDER}
}

# Cleanup when killed
trap cleanup EXIT INT

# Run apache process in foreground
echo "Running apache2 on ${WORKSPACE} (${FOLDER})"
apachectl -d ${FOLDER} -f ${CONF} -e info -D FOREGROUND


