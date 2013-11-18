#!/bin/bash

# Exit early
set -e


###
# Constants
###
BASE_REPO="codebox"
SRC_DIR=$(readlink -f ..)
TMP_SRC="/tmp/codebox_src"
STACK_SRC="${SRC_DIR}/stacks/base/src"

###
# Functions
###
function get_image_id() {
    # Function arg
    local repo=$1
    local tag=$2

    # Local variable
    local parts

    # Get line from docker images
    local input=$(docker images | grep ${repo} |  grep ${tag})

    # Split
    read -a parts <<< "${input}"

    # "return" the image id by echoing it
    echo "${parts[2]}"
}

# Get a clean copy of the codebox code
function clean_src() {
    # Ensure tmp dir exists
    mkdir -p ${TMP_SRC}

    # Copy over source
    cp -r ${SRC_DIR}/* "${TMP_SRC}"

    # Cleanup tmp src
    rm -rf "${TMP_SRC}/node_modules"
    rm -rf "${TMP_SRC}/client/build/*"
}

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
VERSION=$(git tag -l | sort -V | head -n 1)

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

# We need codebox's source for the base image
if [[ ${STACK} == "base" ]]; then
    clean_src
    mv ${TMP_SRC} ${STACK_SRC}
fi;

# Build docker image
echo "Building ${REPO}:${TAG}"
docker build -t "${REPO}:${TAG}" "${STACK}"
BUILD_ERROR=$?

# Build error
if [ ! $BUILD_ERROR == 0 ]; then
    echoerr "Failed building ${REPO}:${TAG}"
    exit -1
fi;

# Cleanup tmp src folder
if [[ ${STACK} == "base" ]]; then
    rm -rf "${TMP_SRC}"
    rm -rf "${STACK_SRC}"
fi;


# Get the image ID of what we just built
IMAGE_ID=$(get_image_id "${REPO}" "${TAG}")

# Give that image the "latest" tag
echo "Tagging ${IMAGE_ID} to ${REPO}:latest"
docker tag "${IMAGE_ID}" "${REPO}" "latest"

# Finished
echo "Finished building ${REPO}:${TAG}"
