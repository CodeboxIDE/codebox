#!/usr/bin/env bash
# bin/use <build-dir>

if [ -f $1/build.gradle ]; then
   echo "Gradle" && exit 0
else
  echo "no" && exit 1
fi
