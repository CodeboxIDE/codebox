#!/bin/bash

WORKSPACE=$1
PORT=$2

# Detect current platform
# We need this to customize configuration differently for OS X and Linux
platform=$(uname)

# 2 byte random number in hexadecimal (0xffff)
RAND_ID=$(openssl rand 2 -hex)

# Folder to store our config and other stuff
FOLDER="/tmp/apache-${RAND_ID}"

# Name of conf file
CONF="apache2.conf"

# Create the folder
mkdir -p ${FOLDER}

# Generate the apache config
cat  <<EOF > "${FOLDER}/${CONF}"
ServerName localhost
Listen ${PORT}
PidFile ${FOLDER}/httpd.pid
LockFile ${FOLDER}/accept.lock

# Serve our workspace
DocumentRoot "${WORKSPACE}"
<Directory />
  AllowOverride all
  Order allow,deny
  Allow from all
</Directory>

AddType application/x-httpd-php .php
DirectoryIndex index.html index.php

# Include module configuration:
Include /etc/apache2/mods-enabled/*.load
Include /etc/apache2/mods-enabled/*.conf

# Include generic snippets of statements
Include /etc/apache2/conf.d/

EOF

# Run apache process in foreground
apachectl -d ${FOLDER} -f ${CONF} -e info -DFOREGROUND
