#!/bin/bash

SCRIPTPATH=$(cd -P -- "$(dirname -- "$0")" && pwd -P)

NW_VERSION=${NW_VERSION:=0.8.0}
REBUILD_MODULES=("shux/node_modules/pty.js" "ctags" "gittle/node_modules/pty.js" "vfs-local/node_modules/pty.js")

function rebuild_module () {
  bash -c "cd $1 && $SCRIPTPATH/../node_modules/.bin/nw-gyp rebuild --target=$NW_VERSION"
}

for module in ${REBUILD_MODULES[@]}; do
  rebuild_module node_modules/$module
done