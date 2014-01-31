#!/bin/bash

WORKSPACE=$1
PORT=$2


# Use HHVM if it exists
if [[ ! -z "$(which hhvm)" ]]; then
    bash -c "cd ${WORKSPACE} && hhvm -m server -p ${PORT}"
# Use Apache2 if it is installed
elif [[ ! -z "$(which apache2ctl)" ]]; then
    exec ./_run_apache.sh ${WORKSPACE} ${PORT}
# Fallback to builtin PHP server
else
    php -S "0.0.0.0:${PORT}" -t ${WORKSPACE}
fi
