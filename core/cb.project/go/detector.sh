#!/usr/bin/env bash
# bin/detect <build-dir>
set -e

if test -n "$(find "$1" -type f -name '*.go' | sed 1q)"
then echo Go
else echo no; exit 1
fi
