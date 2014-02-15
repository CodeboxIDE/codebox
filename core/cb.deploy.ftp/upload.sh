#!/bin/sh
LOCALDIR=$4
REMOTESERVER=$1
REMOTEPATH=$2
LOGIN=$3
read -s -p "Enter Password: " PASSWORD
 
cd $LOCALDIR
ftp -n $REMOTESERVER <<INPUT_END
quote user $LOGIN
quote pass $PASSWORD
cd $REMOTEPATH
prompt off
mput *.*
exit
INPUT_END