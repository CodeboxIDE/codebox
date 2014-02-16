#!/bin/sh

if [ -f $1/config/global.json ] && [ -f $1/cloud/main.js ]; then
  echo "Parse"
  exit 0
else
  exit 1
fi
