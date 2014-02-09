#!/usr/bin/env bash
# bin/use <build-dir>

if [ -f $1/Gemfile ]; then
   echo "Ruby" && exit 0
else
  echo "no" && exit 1
fi
