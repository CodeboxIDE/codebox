#!/bin/bash

# This script will prepare ace for running properly

RM_EXTENSIONS=(elastic_tabstops_lite chromevox statusbar emmet error_marker keybinding_menu old_ie textarea themelist static_highlight split spellcheck settings_menu)
RM_LANG=(abap cobol forth mushcode vbscript tcl velocity pascal powershell asciidoc apache_conf ada soy_template verilog vhdl autohotkey batchfile c9search)

# Sed like command using perl
# We need this because on OS X, sed does not support ignoring case
function PSED {
    perl -C -e 'use utf8;' -i -pe $1 $2
}

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
    PSED "s/,?${lang}\:\[\"[^\"]+?\"\]//gi" ace/ext-modelist.js

    # Remove readable name mapping
    PSED "s/,?${lang}\:\"\w+\"//gi" ace/ext-modelist.js
done

# Cleanup our previous replaces
# Remove any bad comas left over from modelist
PSED "s/\{,/{/gi" ace/ext-modelist.js
PSED "s/,\}/{/gi" ace/ext-modelist.js

# Detect empty snippets
# using the value of their 'snippetText' variable
SREGEX="snippetText=(\"\"|\'\')"

# Remove empty snippet files
find ./ace/snippets -name "*.js" -print | \
xargs grep -E ${SREGEX} -l | \
xargs rm -f


# Remove useless themes
echo "Removes themes"
rm -rf ace/theme-*.js