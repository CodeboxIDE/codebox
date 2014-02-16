#!/bin/sh

if [ -f $1/app.yaml ]; then
  echo "AppEngine"
  exit 0
else
  exit 1
fi
