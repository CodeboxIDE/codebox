#!/bin/bash

# Version of git to build
GIT_VERSION="v1.9.0"

# Architecture to build for
TARGET_ARCH="64"

SRC_DIR="/tmp/git-src-${GIT_VERSION}"
DEST_DIR="${PWD}/extras/git"

# Utility function
function cleanup {
    echo "Cleaning up ..."
    rm -rf "${SRC_DIR}"
}
trap cleanup EXIT INT

# URL to a tarball of the git source
TGZ_URL="https://codeload.github.com/git/git/tar.gz/${GIT_VERSION}"

# Download git source
echo "Downloading ..."
mkdir -p ${SRC_DIR}
curl "${TGZ_URL}" | tar -xzv -C "${SRC_DIR}" --strip-components=1


# Do build
echo "Building ..."
bash -c "
    cd "${SRC_DIR}" &&
    make configure &&
    ./configure --prefix="${DEST_DIR}" CC='gcc -m${TARGET_ARCH}' &&
    make &&
    make install
"

# done
