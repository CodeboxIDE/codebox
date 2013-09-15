#!/bin/bash

# Constants
USER="friendcode"
HOME="/home/${USER}/"
WORKSPACE="${HOME}/workspace/"
SSH_DIR="${HOME}.ssh/"

## Variables provided by environment
# RSA_PRIVATE, RSA_PUBLIC
# EMAIL, NAME, USERNAME
# GIT_URL, GIT_PASSWD (some private token)


function setup_user () {
    # Add user
    adduser ${USER}

    # Create workspace dir
    mkdir -p ${WORKSPACE}
}

function setup_ssh () {
    # Ensure directory
    mkdir -p ${SSH_DIR}

    # Store keys
    echo "${RSA_PUBLIC}" | tee "S{SSH_DIR}id_rsa.pub"
    echo "${RSA_PRIVATE}" | tee "S{SSH_DIR}id_rsa"
}

function setup_netrc () {
    # Git auth over http/https with token
    echo "machine friendco.de
        login ${USERNAME}
        password ${GIT_PASSWD}
    " >> "${HOME}.netrc"
}

function setup_git () {
    git clone ${GIT_URL} ${WORKSPACE}
}

# Do all setups
setup_user
setup_ssh
setup_netrc
setup_git
