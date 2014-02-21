#!/bin/bash

SOURCE=appBuilds/releases/Codebox/linux32/
OUTPUT=appBuilds/releases/codebox-linux32.tar.gz

echo "Building Linux Tar: $OUTPUT"
tar -zcvf $OUTPUT -C ${SOURCE} Codebox