#!/usr/bin/env bash
# bin/use <build-dir>

WORKSPACE=$1

if [ -f "${1}/pom.xml" ]; then
   echo "Maven" && exit 0
else
  echo "no" && exit 1
fi
