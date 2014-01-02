#!/bin/bash

WORKSPACE=$1
PORT=$2

function json_value {
    # JSON data
    local json = $1

    # Property to extract
    local prop = $2

    # Extract value
    local temp = echo $json | sed 's/\\\\\//\//g' | sed 's/[{}]//g' | awk -v k="text" '{n=split($0,a,","); for (i=1; i<=n; i++) print a[i]}' | sed 's/\"\:\"/\|/g' | sed 's/[\,]/ /g' | sed 's/\"//g' | grep -w $prop| cut -d":" -f2| sed -e 's/^ *//g' -e 's/ *$//g'

    # Return value
    echo ${temp##*|}
}

# Data
JSON=$(cat ${})