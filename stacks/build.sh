#!/bin/sh

# Build each sub directory stack
ls -d */ | sort | xargs -I{} ./buildstack.sh {}
