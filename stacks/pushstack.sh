#!/bin/bash

STACK=$1

if [ -z "${STACK}" ]; then
    echo "Must provide stack to push" >&2
    exit -1
fi;

docker push "codebox/codebox.${STACK}"
