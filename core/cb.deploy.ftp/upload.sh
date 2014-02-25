#!/bin/bash

LOCALDIR=$3
REMOTESERVER=$1
REMOTEPATH=$2
LOGIN=$4
PASSWORD=$5

if [ -z "$PASSWORD" ]; then
    read -s -p "Enter Password: " PASSWORD
fi

cd $LOCALDIR
ftp -n $REMOTESERVER <<INPUT_END
quote user $LOGIN
quote pass $PASSWORD
cd $REMOTEPATH
prompt off
mput *.*
exit
INPUT_END