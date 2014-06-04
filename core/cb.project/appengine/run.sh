#!/bin/bash

# Script args
WORKSPACE=$1
PORT=$2

cd $WORKSPACE && dev_appserver.py ./ --port=${PORT} --host=0.0.0.0
