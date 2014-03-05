#!/bin/bash

# Script args
WORKSPACE=$1
PORT=$2

# Get full path to manage.py script of the project
MANAGE_PATH=$(find ${WORKSPACE} -name "manage.py" | head -n 1)

# Run django development server
python ${MANAGE_PATH} runserver "0.0.0.0:${PORT}"
