#!/bin/bash

SCRIPTPATH=$(cd -P -- "$(dirname -- "$0")" && pwd -P)

NW_VERSION=$1
REBUILD_MODULES=("shux/node_modules/pty.js" "ctags" "gittle/node_modules/pty.js" "vfs-local/node_modules/pty.js")

echo $NW_VERSION
function rebuild_module () {
  bash -c "cd $1 && $SCRIPTPATH/../node_modules/nw-gyp/bin/nw-gyp.js rebuild --target=$NW_VERSION"
}

for module in ${REBUILD_MODULES[@]}; do
  rebuild_module node_modules/$module
done