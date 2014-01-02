#!/bin/bash

WORKSPACE=$1
PORT=$2

php -S "0.0.0.0:${PORT}" -t ${WORKSPACE}
