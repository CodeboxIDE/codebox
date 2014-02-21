#!/bin/bash

SOURCE=appBuilds/releases/Codebox/linux32/Codebox
OUTPUT=appBuilds/releases/codebox-linux32.tar.gz

echo "Building Linux Tar: $OUTPUT"
tar -zcvf $OUTPUT ${SOURCE}