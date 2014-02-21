#!/bin/bash

# Constants
export USER='codebox'
export TERM='xterm-256color'
export HOME="/home/codebox"
WORKSPACE="${HOME}/workspace/"
SSH_DIR="${HOME}/.ssh/"
CODEBOX_DIR="/opt/codebox"
SERVER_SCRIPT="${CODEBOX_DIR}/bin/codebox.js"
PYTHON_ACTIVATE="/opt/virtualenv/bin/activate"
# Extra flags for the codebox server
CBFLAGS=""

## Variables provided by environment
# RSA_PRIVATE, RSA_PUBLIC
# EMAIL, NAME, USERNAME
# GIT_URL, GIT_USER, GIT_PASSWD (some private token)
# GIT_HOST, WEBHOOK_URL


function setup_workspace () {
    echo "Calling setup_workspace ..."

    # Create workspace dir
    mkdir -p ${WORKSPACE}
}


function setup_ssh () {
    echo "Calling setup_ssh ..."

    if [ ! "$RSA_PUBLIC" ] || [ ! "$RSA_PRIVATE" ]; then
        echo "Skipping setup_ssh, no private and public keys to setup ..."
    fi

    # Ensure directory
    mkdir -p ${SSH_DIR}

    # Store/Update keys
    echo "${RSA_PUBLIC}" | tee "${SSH_DIR}id_rsa.pub"
    echo "${RSA_PRIVATE}" | tee "${SSH_DIR}id_rsa"

    chmod 600 "${SSH_DIR}id_rsa.pub"
    chmod 600 "${SSH_DIR}id_rsa"
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

    if [ ! "$GIT_URL" ]; then
        echo "Skipping setup_git because no GIT_URL given ..."
        echo "Init empty git repository in workspace ..."
        git init ${WORKSPACE}
        return
    fi

    # Do cloning
    git clone ${GIT_URL} ${WORKSPACE}
}

function setup_hg () {
    echo "Calling setup_hg ..."

    # Skip if git directory exists
    if [ -d "$WORKSPACE.hg" ]; then
        "Skipping setup_hg because WORKSPACE is already setup ..."
        return
    fi

    if [ ! "$HG_URL" ]; then
        echo "Skipping setup_hg because no HG_URL given ..."
        echo "Init empty hg repository in workspace ..."
        hg init ${WORKSPACE}
        return
    fi

    # Do cloning
    hg clone ${HG_URL} ${WORKSPACE}
}

# Sets up a codebox sample if one exists
function setup_sample () {
    CBFLAGS="${CBFLAGS} --sample ${CODEBOXIO_STACK}"
}

# Sets up git or mercurial
function setup_repo () {
    echo "Calling setup_repo ..."

    # Check if workspace directory already contains stuff
    if [ -n "$(ls -A ${WORKSPACE})" ]; then
        echo "Skipping setup_repo because workspace folder is not empty"
        return
    fi

    # Check if we should setup either
    # git or mercurial based on env variables provided
    if [ -n "$GIT_URL" ]; then
        setup_git
        return
    elif [ -n "$HG_URL" ];then
        setup_hg
        return
    elif [ -n "$CODEBOXIO_STACK" ]; then
        setup_sample
    fi
}

function setup_perm () {
    echo "Calling setup_perm ..."

    chown ${USER} -R ${HOME}
    chmod +x ${SSH_DIR}
    chmod 600 ${SSH_DIR}*

    # Ensure /tmp's permissions
    sudo chmod 777 /tmp
}

function setup_appengine () {
    # PHP and Python
    if [ -d "/opt/google_appengine" ]; then
        export PATH="/opt/google_appengine:${PATH}"
    # GO
    elif [ -d "/opt/go_appengine" ]; then
        export PATH="/opt/go_appengine:${PATH}"
        export GOROOT="/opt/go_appengine/goroot"
        export GOPATH="/opt/go_appengine/gopath"
    # Java
    elif [ -d "/opt/java_appengine" ]; then
        export PATH="/opt/java_appengine/bin:${PATH}"
    fi
}

function setup_env () {
    echo "Calling setup_env ..."

    # Set home
    export CODEBOX_USER=${USER}
    export WORKSPACE_DIR=${WORKSPACE}
    export WORKSPACE_ADDONS_DIR="${HOME}/.codebox-addons/"

    # Set command prompt
    export PS1="\[$(tput setaf 1)\]\u\[$(tput setaf 3)\] \W \[$(tput setaf 2)\]# \[$(tput sgr0)\]"

    # Set App Engine related variables
    setup_appengine

    # Unset sensitive stuff
    unset RSA_PRIVATE
    unset RSA_PUBLIC
    unset GIT_PASSWD
}

function setup_python () {
    echo "Callling setup_python ..."
    if [ -f "${PYTHON_ACTIVATE}" ]; then
        source "${PYTHON_ACTIVATE}"
        return
    fi;
    echo "Skipped setup_python ..."
}

function start_server () {
    echo "Calling start_server ..."

    cd ${WORKSPACE}
    exec ${SERVER_SCRIPT} run ${WORKSPACE} ${CBFLAGS}
}

# Do all setups
setup_workspace
setup_ssh
setup_netrc
setup_perm
setup_repo
# If git clone fails we need to rebuild dir
setup_workspace
setup_env
setup_python
start_server
