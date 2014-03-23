#!/usr/bin/env bash
# bin/use <build-dir>

# Constants
FGREP="fgrep"

# Check if ag exists
which ag
if [ $? = 0 ]; then
   FGREP="ag"
fi

WORKSPACE=$1
entry_point=$(${FGREP} " public static void main" -R ${WORKSPACE} | tr ':' '\n' | grep ".java" | head -n 1)

if [ -f "$entry_point" ]; then
   echo "Java" && exit 0
else
  echo "no" && exit 1
fi
