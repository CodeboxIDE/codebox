#!/bin/bash

# Exit early
set -e


###
# Constants
###
BASE_REPO="codebox/codebox"

# Echo to stderr
echoerr() { echo "$@" 1>&2; }


###
# Parse args
###

# Ugly when to normalize path
STACK=$(dirname $1/x)
# Path to dockerfile
DOCKERFILE="${PWD}/${STACK}/Dockerfile"
# Use latest git tag as version
VERSION=$(git tag -l | sort -V -r | head -n 1)

echo $STACK
echo $DOCKERFILE
echo $VERSION


# Check if good stack name is provided
if [[ ${STACK} == "/" ]]; then
    echoerr "Invalid stack name"
    exit -1
fi;

# Check if stack exists
if [ ! -f ${DOCKERFILE} ]; then
    echoerr "'${DOCKERFILE}' does not exist"
    echoerr "The '${STACK}' stack requires a Dockerfile"
    exit -1
fi;


###
# Docker stuff
###
REPO="${BASE_REPO}.${STACK}"
TAG=$VERSION

# Build docker image
echo "Building ${REPO}:${TAG}"
docker build -t "${REPO}:${TAG}" "${STACK}"
BUILD_ERROR=$?

# Build error
if [ ! $BUILD_ERROR == 0 ]; then
    echoerr "Failed building ${REPO}:${TAG}"
    exit -1
fi;

# Finished
echo "Finished building ${REPO}:${TAG}"
