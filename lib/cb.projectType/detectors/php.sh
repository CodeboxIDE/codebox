#!/usr/bin/env bash

if [ -f $1/index.php ]; then
  echo "PHP" && exit 0
else
  echo "no" && exit 1
fi

