#!/bin/bash


function strip() {
    local val=${1%/}
    echo $val
}

for d in $(ls -d */); do
    ./pushstack.sh $(strip $d)
done;