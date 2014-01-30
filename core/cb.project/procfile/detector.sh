#!/bin/sh

if [ -f $1/Procfile ]; then
  echo "Procfile"
  exit 0
else
  exit 1
fi
