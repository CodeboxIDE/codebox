#!/usr/bin/env bash
# bin/use <build-dir>

BIN_DIR=$(cd $(dirname $0); pwd)
BUILD_DIR=$1

. $BIN_DIR/common

## SBT 0.10 allows either *.sbt in the root dir, or project/*.scala or .sbt/*.scala
if detect_sbt $BUILD_DIR ; then
  if is_play $BUILD_DIR ; then
    PLAY_2_X="Play 2.x"
    DETECTED_PLAY_LANG=$(detect_play_lang $BUILD_DIR);
    if [ $DETECTED_PLAY_LANG ] ; then
      echo "$PLAY_2_X - $DETECTED_PLAY_LANG"
    else
      echo "$PLAY_2_X"
    fi
  else
    echo "Scala"
  fi
  exit 0
else
  echo "no" && exit 1
fi
