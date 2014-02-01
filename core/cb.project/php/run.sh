#!/bin/bash

WORKSPACE=$1
PORT=$2

# Dir of current script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Use HHVM if it exists
if [[ ! -z "$(which hhvm)" ]]; then
    bash -c "cd ${WORKSPACE} && hhvm -m server -p ${PORT}"
# Use Apache2 if it is installed
elif [[ ! -z "$(which apachectl)" ]]; then
    exec "${DIR}/_run_apache.sh" ${WORKSPACE} ${PORT}
# Fallback to builtin PHP server
else
    php -S "0.0.0.0:${PORT}" -t ${WORKSPACE}
fi
