#!/bin/sh

if [ -f $1/main.c ]; then
  echo "C"
  exit 0
else
  exit 1
fi
