#!/bin/bash

# [shoreman](https://github.com/hecticjeff/shoreman) is an
# implementation of the **Procfile** format. Inspired by the original
# [foreman](http://ddollar.github.com/foreman/) tool for ruby, as
# well as [norman](https://github.com/josh/norman) for node.js.

# Make sure that any errors cause the script to exit immediately.
set -e

# Program count, incremented by 1 on each exec. (Used in rotating colors.)
PROGRAM_COUNT=0

# ## Logging

# Pick a color from a preset given an integer, echo ANSI escape sequence.
pick_color() {
    if [ $# -eq 0 ]; then
        return
    fi

    local number=$1
    shift

    local cyan='\033[36m'
    local magenta='\033[35m'
    local red='\033[31m'
    local green='\033[32m'
    local yellow='\033[33m'

    local colors=( $cyan $magenta $red $green $yellow )
    let index=$number%5
    echo ${colors[$index]}
}

# Execute <first_argument> for each line in stdin.
#
# map_lines function forked from the nixd project.

# Understanding the internal field separator (IFS) in bash:
#
# The IFS is used in word splitting. To split across lines in a string, a
# for-loop can simply iterate across that string with IFS set to the
# newline character. IFS must be restored to support normal operation of
# any further commands.
map_lines() {
    local line_function=$1
    shift

    local OLD_IFS="$IFS"
    local NEW_IFS=$'\n' # Specifying ANSI escaped char requires $'string' form.

    IFS="$NEW_IFS"
    local count=0
    while read line; do
        IFS="$OLD_IFS"
        $line_function "$line"
        local result=$?
        IFS="$NEW_IFS"
        if [ $result -ne 0 ]; then
            # Ensure errors do not get swallowed in this loop.
            return $result
        fi
    done
    IFS="$OLD_IFS"
}

# For logging we want to prefix each entry with the current time, as well
# as the process name. This takes one argument, the name of the process, and
# then reads data from stdin, formats it, and sends it to stdout.
log() {
  __TAB_CHARACTER=$'\t'
  echo -e "$PROCFILE_LOG_COLOR$(date +"%H:%M:%S") $PROCFILE_LOG_NAME${__TAB_CHARACTER}|\033[0m $1"
}

# ## Running commands

# When a process is started, we want to keep track of its pid so we can
# `kill` it when the parent process receives a signal, and so we can `wait`
# for it to finish before exiting the parent process.
store_pid() {
  pids=("${pids[@]}" "$1")
}

# This starts a command asynchronously and stores its pid in a list for use
# later on in the script.
start_command() {
  sh -c "$1" 2>&1 | map_lines log &  
  pid="$!"
  store_pid "$pid"
}

# ## Reading the .env file

# The .env file needs to be a list of assignments like in a shell script.
# Only lines containing an equal sign are read, which means you can add comments.
# Preferably shell-style comments so that your editor print them like shell scripts.

ENV_FILE=$1/.env
if [ -f $ENV_FILE ]; then
  while read line || [ -n "$line" ]; do
    if [[ "$line" == *=* ]]; then
      eval "export $line"
    fi
  done < "$ENV_FILE"
fi

# ## Reading the Procfile

# The Procfile needs to be parsed to extract the process names and commands.
# The file is given on stdin, see the `<` at the end of this while loop.
PROCFILE=$1/Procfile
while read line || [ -n "$line" ]; do
  name=${line%%:*}
  command=${line#*: }

  export PROCFILE_LOG_COLOR=`pick_color $PROGRAM_COUNT`
  export PROCFILE_LOG_NAME="${name}.1"
  let PROGRAM_COUNT=PROGRAM_COUNT+1

  start_command "$command"
  log "'${command}' started with pid ${pid}"
  
done < "$PROCFILE"

# ## Cleanup

# When a `SIGINT`, `SIGTERM` or `EXIT` is received, this action is run, killing the
# child processes. The sleep stops STDOUT from pouring over the prompt, it
# should probably go at some point.
onexit() {
  echo SIGINT received
  echo sending SIGTERM to all processes
  kill ${pids[*]} &>/dev/null
  sleep 1
}
trap onexit SIGINT SIGTERM EXIT

# Wait for the children to finish executing before exiting.
wait