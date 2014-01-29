#!/bin/sh

# Consider a project is a D project, if it contains .D files
if test -n "$(find "$1" -type f -name '*.d' -not -path '*/node_modules/*'| sed 1q)"
then echo D; exit 0
else echo no; exit 1
fi
