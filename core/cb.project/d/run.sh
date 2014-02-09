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
entry_point=$(${FGREP} "[int|void] main\(" -R ${WORKSPACE} | tr ':' '\n' | grep ".d" | head -n 1)

# No entry point found
# default to main.d
if [ -z "$entry_point" ]; then
    entry_point="./main.d"
fi

if [ -f ${entry_point} ]; then
    exec dmd -run ${entry_point}
else
    # Exit
    exit 1
fi
