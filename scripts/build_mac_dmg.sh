#!/bin/bash

SOURCE=appBuilds/releases/Codebox/mac/
TITLE=Codebox
OUTPUT=appBuilds/releases/codebox-mac.dmg

echo "Building Mac Release DMG file: $OUTPUT"
hdiutil create $OUTPUT -volname "${TITLE}" -fs HFS+ -srcfolder "${SOURCE}"