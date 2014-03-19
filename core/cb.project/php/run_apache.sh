#!/bin/bash

WORKSPACE=$1
PORT=$2

# Dir of current script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

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

# Include phpmyadmin only if there
if [[ -f "/etc/apache2/conf.d/phpmyadmin.conf" ]]; then
  EXTRA_CONF+="
Include /etc/apache2/conf.d/phpmyadmin.conf
"
fi

# Create the necessary folders
mkdir -p ${FOLDER}
mkdir -p "${FOLDER}/logs"

PID_FILE="${FOLDER}/httpd.pid"
LOCK_FILE="${FOLDER}/accept.lock"

# Generate the apache config
cat  <<EOF > "${FOLDER}/${CONF}"
ServerName localhost
Listen ${PORT}
PidFile ${PID_FILE}
LockFile ${LOCK_FILE}

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

# Keep track of MySQL setup state
SUDO_MYSQL=false
MYSQL_STARTED=false
MYSQL_PORT=3306

function is_mysql_running() {
    # Check if there is a TCP server listening on MySQL's port
    netstat -nat | grep -i listen | grep -e "[\:\.]${MYSQL_PORT}" &> /dev/null
    # Check for success
    if [ $? == 0 ]; then
      echo "true"
    fi
}

# Echoes sudo if the system supports sudo without password for current user (codebox.io boxes for example)
function needs_sudo_pwd() {
    sudo -n echo | head -n 1 | grep -q -v "sudo:"
    if [ $? == 0 ]; then
        # No password needed
        echo "true"
    fi
}

# Start mysql and set SUDO_MYSQL
function start_mysql() {
    echo "Starting MySQL server ..."

    # Commands
    local sudo_mysql="mysqld --user=root"
    local mysql="mysqld"

    # Exit if MySQL is not on $PATH
    if [ -z "$(which mysqld)" ]; then
        echo "Could not start MySQL because it is not installed on the system's \$PATH"
    fi

    # Specify that MySQL was started by this script
    # And thus we handle it's termination
    MYSQL_STARTED=true

    echo "MySQL RUNNING = $(is_mysql_running)"
    # Check if MySQL is already running
    if [ -n "$(is_mysql_running)" ]; then
        echo "MySQL appears to already be running on PORT=${MYSQL_PORT}"
        return
    fi

    local needs_pwd="$(needs_sudo_pwd)"
    # Try running in sudo or not
    if [ -n ${needs_pwd} ]; then
        sudo -n ${sudo_mysql} &
        SUDO_MYSQL=true
    else
        ${mysql} &
    fi

    # If MySQL is not running
    if [ -z "$(is_mysql_running)" ]; then
        # Try running with sudo (and passwd prompt)
        if [ ! $SUDO_MYSQL ]; then
            echo "Please enter sudo password for MySQL"
            sudo ${sudo_mysql} &
            SUDO_MYSQL=true
        fi
    else
        echo "MySQL is up and running"
    fi

    # After all our different tries is MySQL up ?
    if [ -n "$(is_mysql_running)" ]; then
        MYSQL_STARTED=true
    fi
}

# Stop MySQL started by "start_mysql"
function stop_mysql() {
    echo "Killing MySQL"

    # MySQL wasn't started by this script
    # or is already dead
    if [ ! $MYSQL_STARTED ] || [ -z "$(is_mysql_running)" ]; then
        echo "No need to kill MySQL, it is not running"
        # So do nothing
        return
    fi

    # Force kill MySQL
    if [ $SUDO_MYSQL ]; then
        echo "Killing Sudo MySQL"
        sudo -n killall -s KILL mysqld
    else
        killall -s KILL mysqld
    fi
}

# Wait for a process or group of processes
function anywait() {
    for pid in "$@"; do
        while kill -0 "$pid" &> /dev/null; do
            sleep 0.5
        done
    done
}

function cleanup {
    # Kill Apache
    if [[ -f ${PID_FILE} ]]; then
        echo "Killed process"
        # Kill process and all children
        kill -KILL -- -$(cat ${PID_FILE})
    fi

    # Kill MySQL
    stop_mysql

    # Remove folder on exit
    echo "Cleaning up ${FOLDER}"
    rm -rf ${FOLDER}
    exit
}

# Cleanup when killed
trap cleanup EXIT INT KILL TERM

# Run MySQL
start_mysql

# Run apache process in foreground
echo "Running apache2 on ${WORKSPACE} (${FOLDER})"
/usr/sbin/apachectl -d ${FOLDER} -f ${CONF} -e info

# Wait for PID_FILE to appear, timeout after 5s
bash ${DIR}/_waitfile.sh ${PID_FILE} 5

# Wait for Apache process
PID=$(cat ${PID_FILE})
echo "Waiting for Apache2 process : ${PID}"
anywait ${PID}
echo "Apache is dead (pid=${PID})"



