#!/bin/bash

# Script args
WORKSPACE=$1
PORT=$2

cd $WORKSPACE && pub serve --port=${PORT}