#!/bin/bash

WORKSPACE=$1
PORT=$2

# Dir of current script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Use HHVM if it exists
if [[ ! -z "$(which hhvm)" ]]; then
    bash -c "cd ${WORKSPACE} && hhvm -m server -p ${PORT}"
# Use apache if it exists on current system
elif [[ -f "/usr/sbin/apachectl" ]]; then
    bash ${DIR}/run_apache.sh "${WORKSPACE}" ${PORT}
# Fallback to builtin PHP server
else
    php -S "0.0.0.0:${PORT}" -t ${WORKSPACE}
fi
