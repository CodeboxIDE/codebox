#!/usr/bin/env bash
# bin/detect <build-dir>

if [ -d $1/.meteor/ ]; then
  echo "Meteor" && exit 0
else
  echo "no" && exit 1
fi
