#!/bin/bash

# Constants
WORKSPACE="${HOME}/workspace/"
SSH_DIR="${HOME}/.ssh/"
SERVER_SCRIPT="/opt/codebox/bin/codebox.js"
PYTHON_ACTIVATE="/opt/virtualenv/bin/activate"

## Variables provided by environment
# RSA_PRIVATE, RSA_PUBLIC
# EMAIL, NAME, USERNAME
# GIT_URL, GIT_BRANCH, GIT_USER, GIT_PASSWD (some private token)
# GIT_HOST, WEBHOOK_URL


function setup_workspace () {
    echo "Calling setup_workspace ..."

    # Create workspace dir
    mkdir -p ${WORKSPACE}
}


function setup_ssh () {
    echo "Calling setup_ssh ..."

    if [ ! $RSA_PUBLIC ] || [ ! $RSA_PRIVATE ]; then
        echo "Skipping setup_ssh, no private and public keys to setup ..."
    fi

    # Ensure directory
    mkdir -p ${SSH_DIR}

    # Store/Update keys
    echo "${RSA_PUBLIC}" | tee "${SSH_DIR}id_rsa.pub"
    echo "${RSA_PRIVATE}" | tee "${SSH_DIR}id_rsa"

    chmod 600 "${SSH_DIR}id_rsa.pub"
    chmod 600 "${SSH_DIR}id_rsa"

    ssh-keyscan -H github.com >> "${SSH_DIR}known_hosts"
    ssh-keyscan -H bitbucket.org >> "${SSH_DIR}known_hosts"
}


function setup_netrc () {
    echo "Calling setup_netrc ..."

    # No valid things to setup
    if [ ! $GIT_HOST ] || [ ! $GIT_USER ] || [ ! $GIT_PASSWD ]; then
        echo "Skipping setup_netrc ..."
        return
    fi

    local filename="${HOME}/.netrc"

    # Exit if already there
    if grep -i "machine ${GIT_HOST}" $filename; then
        return
    fi

    # Git auth over http/https with token
    echo "machine ${GIT_HOST}
        login ${GIT_USER}
        password ${GIT_PASSWD}
    " >> $filename

    chmod 600 $filename
}


function setup_git () {
    echo "Calling setup_git ..."

    # Skip if git directory exists
    if [ -d "$WORKSPACE.git" ]; then
        "Skipping setup_git because WORKSPACE is already setup ..."
        return
    fi

    if [ ! $GIT_URL ]; then
        echo "Skipping setup_git because no GIT_URL given ..."
        echo "Init empty git repository in workspace ..."
        git init ${WORKSPACE}
        return
    fi

    # Do cloning
    git clone -b ${GIT_BRANCH} ${GIT_URL} ${WORKSPACE}
}


function setup_perm () {
    echo "Calling setup_perm ..."

    chown ${USER} -R ${HOME}
    chmod 0600 -R ${SSH_DIR}
}


function setup_env () {
    echo "Calling setup_env ..."

    # Set home
    export CODEBOX_USER=${USER}
    export WORKSPACE_DIR=${WORKSPACE}
    export WORKSPACE_ADDONS_DIR="${HOME}/.codebox-addons/"

    # Unset sensitive stuff
    unset RSA_PRIVATE
    unset RSA_PUBLIC
    unset GIT_PASSWD
}

function setup_python () {
    if [ -e "${PYTHON_ACTIVATE}" ]; then
        source "${PYTHON_ACTIVATE}"
    fi;
}

function start_server () {
    echo "Calling start_server ..."

    cd ${WORKSPACE}
    exec ${SERVER_SCRIPT} run -d .
}

# Do all setups
setup_workspace
setup_ssh
setup_netrc
setup_git
setup_perm
setup_env
setup_python
start_server
