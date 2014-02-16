#!/bin/bash

# Script args
WORKSPACE=$1
PORT=$2

# Get app name
APPNAME=`cat ${WORKSPACE}/config/global.json | python -c "import json; import sys; print json.load(sys.stdin)['applications']['_default']['link']"`

echo "Start Parse application '${APPNAME}' (read from config/global.json)"

cd $WORKSPACE && parse develop $APPNAME