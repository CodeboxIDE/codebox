#!/bin/bash

# Ace version to pull
ACE_VERSION="c66eee0b6ba65051250424b726ffd60918ec47ce"
ACE_URL="https://github.com/FriendCode/ace-builds/archive/${ACE_VERSION}.tar.gz"

# Ace build we want to keep
ACE_SUB="src-min-noconflict"

# Current folder
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Destination folder
DEST="${DIR}/ace"

# Make sure $DEST exists
mkdir -p ${DEST}

# Check if it's already downloaded
if [ -f "${DEST}/ace.js" ]; then
    echo "Ace is already downloaded"
    echo "'rm -rf ace' if you want to redownload"
    exit 0
fi

# Download tar.gz and pipe to tar
# decompressing it to $DEST
wget -O - ${ACE_URL} | tar -xzv -C ${DEST} --strip-components=2 ace-builds-${ACE_VERSION}/${ACE_SUB}
