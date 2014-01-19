#!/bin/sh

# this pack is valid for apps with a hello.txt in the root
if [ -f $1/procfile ]; then
  echo "Procfile"
  exit 0
else
  exit 1
fi
