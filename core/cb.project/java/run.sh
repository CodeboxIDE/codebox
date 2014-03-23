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
entry_point=$(${FGREP} " public static void main" -R ${WORKSPACE} | tr ':' '\n' | grep ".java" | head -n 1)
clean_point=${entry_point%.*}
class_point="${clean_point}.class"

if [ -f ${entry_point} ]; then
    echo "Compiling ${entry_point}"
    javac ${entry_point}

    echo "Running ${class_point}"
    echo ""
    java $(basename ${clean_point})

    rm -f "${class_point}"
else
    # Exit
    exit 1
fi
