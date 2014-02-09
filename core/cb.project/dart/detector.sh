#!/bin/sh

if [ -f $1/pubspec.yaml ]; then
  echo "Dart"
  exit 0
else
  exit 1
fi
