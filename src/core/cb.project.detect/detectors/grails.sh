#!/usr/bin/env bash
# bin/use <build-dir>

if [ -d $1/grails-app ]; then
   echo "Grails" && exit 0
else
  echo "no" && exit 1
fi
