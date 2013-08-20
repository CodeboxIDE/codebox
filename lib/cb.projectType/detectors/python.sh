#!/usr/bin/env bash

# This script serves as the
# [**Python Buildpack**](https://github.com/heroku/heroku-buildpack-python)
# detector.
#
# A [buildpack](http://devcenter.heroku.com/articles/buildpacks) is an
# adapter between a Python application and Heroku's runtime.

# ## Usage
# Compiling an app into a slug is simple:
#
#     $ bin/detect <build-dir> <cache-dir>

BUILD_DIR=$1

# Exit early if app is clearly not Python.
if [ ! -f $BUILD_DIR/requirements.txt ] && [ ! -f $BUILD_DIR/setup.py ]; then
  exit 1
fi

echo Python
