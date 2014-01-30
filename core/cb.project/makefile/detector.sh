#!/bin/sh

if [ -f $1/Makefile ]; then
  echo "Makefile"
  exit 0
else
  exit 1
fi
