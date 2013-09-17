#!/bin/bash

# Constants
USER="friendcode"
HOME="/home/${USER}/"
WORKSPACE="${HOME}workspace/"
SSH_DIR="${HOME}.ssh/"
SERVER_SCRIPT="/opt/codebox/bin/codebox.js"

## Variables provided by environment
# RSA_PRIVATE, RSA_PUBLIC
# EMAIL, NAME, USERNAME
# GIT_URL, GIT_BRANCH, GIT_USER, GIT_PASSWD (some private token)


function setup_user () {
    echo "Calling setup_user ..."

    # Add user
    if ! grep -i ${USER} /etc/passwd; then
        adduser ${USER}
    fi;

    # Create workspace dir
    mkdir -p ${WORKSPACE}
}


function setup_ssh () {
    echo "Calling setup_ssh ..."

    # Ensure directory
    mkdir -p ${SSH_DIR}

    # Store/Update keys
    echo "${RSA_PUBLIC}" | tee "${SSH_DIR}id_rsa.pub"
    echo "${RSA_PRIVATE}" | tee "${SSH_DIR}id_rsa"
}


function setup_netrc () {
    echo "Calling setup_netrc ..."

    local filename="${HOME}.netrc"

    # Exit if already there
    if grep -i "machine friendco.de" $filename; then
        return
    fi

    # Git auth over http/https with token
    echo "machine friendco.de
        login ${USERNAME}
        password ${GIT_PASSWD}
    " >> $filename
}


function setup_git () {
    echo "Calling setup_git ..."

    # Skip if git directory exists
    if [ -d "$WORKSPACE.git" ]; then
        return
    fi

    # Do cloning
    git clone -b GIT_BRANCH ${GIT_URL} ${WORKSPACE}
}


function setup_perm () {
    echo "Calling setup_perm ..."

    chown ${USER} -R ${HOME}
}


function setup_env () {
    echo "Calling setup_env ..."

    # Set home
    export HOME=${WORKSPACE}
    export CODEBOX_USER=${USER}
    export WORKSPACE_DIR=${WORKSPACE}
}

function start_server () {
    echo "Calling start_server ..."

    exec node ${SERVER_SCRIPT}
}

# Do all setups
setup_user
setup_ssh
setup_netrc
setup_git
setup_perm
setup_env
start_server
