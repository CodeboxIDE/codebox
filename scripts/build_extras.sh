#!/bin/bash

# Platform to build for
PLATFORM=$(uname -s | tr '[:upper:]' '[:lower:]')

# Architecture to build for
TARGET_ARCH="x64"

# Directory to store "extras"
EXTRAS_DIR="${PWD}/extras"

# Version of node to download
NODE_VERSION="v0.8.23"
NODE_URL="http://nodejs.org/dist/${NODE_VERSION}/node-${NODE_VERSION}-${PLATFORM}-${TARGET_ARCH}.tar.gz"
NODE_DIR="${EXTRAS_DIR}/node"

# Version of git to build
GIT_VERSION="v1.9.0"
GIT_URL="https://s3.amazonaws.com/codebox_build/git-${GIT_VERSION}-${PLATFORM}-${TARGET_ARCH}.tar.gz"
GIT_DIR="${EXTRAS_DIR}/git"

# Utility function
function cleanup {
    echo "Cleaning up ..."
    rm -rf "${EXTRAS_DIR}/*"
}
trap cleanup INT

# Download and decompress tar.gz
function download_to {
    mkdir -p ${2}
    curl ${1} | tar -xzv -C "${2}" --strip-components=1
}

download_to ${GIT_URL} ${GIT_DIR}
download_to ${NODE_URL} ${NODE_DIR}
