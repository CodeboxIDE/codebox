#!/bin/bash

WORKSPACE=$1
PORT=$2

ret=`python -c 'import sys; print("%i" % (sys.hexversion<0x03000000))'`
if [ $ret -eq 0 ]; then # python 3
   python -m http.server ${PORT}                                                  
else # python 2                                               
   python -m SimpleHTTPServer ${PORT}                                             
fi
