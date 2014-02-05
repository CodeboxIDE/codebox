#!/bin/bash

# This script will prepare ace for running properly

RM_EXTENSIONS=(elastic_tabstops_lite chromevox statusbar emmet error_marker keybinding_menu old_ie textarea themelist static_highlight split spellcheck settings_menu)
RM_LANG=(jsoniq xquery abap cobol forth mushcode vbscript tcl velocity pascal)

# Remove useless extensions
for ext in ${RM_EXTENSIONS[*]}
do
    echo "Remove extension $ext"
    rm -f ace/ext-$ext.js
done

# Remove languages
for lang in ${RM_LANG[*]}
do
    echo "Remove language $lang"

    # Remove the files
    rm -f "ace/mode-$lang.js" "ace/snippets/$lang.js" "ace/worker-$lang.js"

    # Remove any references in ext-modelist

    # Remove extension mapping
    perl -C -e 'use utf8;' -i -pe "s/,?${lang}\:\[\"[^\"]+?\"\]//gi" ace/ext-modelist.js

    # Remove readable name mapping
    perl -C -e 'use utf8;' -i -pe "s/,?${lang}\:\"\w+\"//gi" ace/ext-modelist.js
done


# Remove useless themes
echo "Removes themes"
rm -rf ace/theme-*.js