#!/usr/bin/env bash
# bin/use <build-dir>

BUILD_DIR=$1

play_confs=$(cd $BUILD_DIR; find . -wholename "*/conf/application.conf" ! -wholename "*modules*" -type f)

if [ -n "$play_confs" ] && [ ! -f "$BUILD_DIR/project/Build.scala" ]; then
  echo "Play!" && exit 0
else
  echo "no" && exit 1
fi
