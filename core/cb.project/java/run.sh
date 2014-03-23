#!/bin/bash

# Constants
FGREP="fgrep"

# Check if ag exists
which ag
if [ $? = 0 ]; then
   FGREP="ag"
fi

# Script args
WORKSPACE=$1
PORT=$2

# Get plausible entry point
entry_point=$(${FGREP} " main(" -R ${WORKSPACE} | tr ':' '\n' | grep ".java" | head -n 1)

if [ -f ${entry_point} ]; then
    echo "Compiling ${entry_point}"
    exec javac ${entry_point}
else
    # Exit
    exit 1
fi
