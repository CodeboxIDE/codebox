#!/bin/bash

LOCALDIR=$3
REMOTESERVER=$1
REMOTEPATH=$2
LOGIN=$4
PASSWORD=$5

if [ -z "$PASSWORD" ]; then
    read -s -p "Enter Password: " PASSWORD
fi

find $LOCALDIR -mindepth 1 -maxdepth 1 ! -name ".git" -exec ncftpput -R -v -u "$LOGIN" -p "$PASSWORD" $REMOTESERVER $REMOTEPATH {} \;
