#!/bin/bash

WORKSPACE=$1
PORT=$2

# Try running meteor app
meteor run --port ${PORT}
