#!/usr/bin/env bash

BUILD_DIR=$1

# Exit early if app is clearly not a Django app
if [ -z "$(find ${BUILD_DIR} -name manage.py)" ]; then
  exit 1
fi

echo Django
