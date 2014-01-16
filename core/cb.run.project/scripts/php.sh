#!/bin/bash

WORKSPACE=$1
PORT=$2


# Use HHVM if it exists
if [[ ! -z "$(which hhvm)" ]]; then
    bash -c "cd ${WORKSPACE} && hhvm -m server -p ${PORT}"
else
    php -S "0.0.0.0:${PORT}" -t ${WORKSPACE}
fi
