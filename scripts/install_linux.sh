#!/bin/bash

# This script need to be stored with content of app release for linux

# User who is running the installer
USER=$(whoami)

# Folder to install codebox too
CODEBOX_PATH=/home/$USER/.codebox

# Folder with codebox files to install
SCRIPTPATH=$(cd -P -- "$(dirname -- "$0")" && pwd -P)

# Removing base folder if already exists
if [ -e $CODEBOX_PATH ] then
    echo  "Removing old .codebox folder"
    rm -rf $CODEBOX_PATH
    echo ""
fi

# Creating base folder
echo -ne "Creating $CODEBOX_PATH"
mkdir -p $CODEBOX_PATH
echo ""

# Copying files
echo  "Copying files from $SCRIPTPATH"
cp -r $SCRIPTPATH/* $CODEBOX_PATH
echo ""

# Linking libudev.so.1
echo "Linkink libudev.so.1"
paths=(
  "/lib/x86_64-linux-gnu/libudev.so.1" # Ubuntu, Xubuntu, Mint
  "/usr/lib64/libudev.so.1" # SUSE, Fedora
  "/usr/lib/libudev.so.1" # Arch, Fedora 32bit
  "/lib/i386-linux-gnu/libudev.so.1" # Ubuntu 32bit
)
for i in "${paths[@]}"
do
  if [ -f $i ]
  then
    ln -sf "$i" $CODEBOX_PATH/libudev.so.0
    break
  fi
done
echo ""

# Create desktop entry
touch ./codebox.desktop
echo "[Desktop Entry]" >> codebox.desktop
echo "Type=Application" >> codebox.desktop
echo "Encoding=UTF-8" >> codebox.desktop
echo "Name=Codebox" >> codebox.desktop
echo "Comment=Code Editor" >> codebox.desktop
echo "Exec=$CODEBOX_PATH/Codebox" >> codebox.desktop
echo "Icon= $CODEBOX_PATH/icon.png"  >> codebox.desktop
echo "Categories=Utilities/TextEditor" >> codebox.desktop
echo "Terminal=false" >> codebox.desktop

echo "Granting the shortcut execution permissions"
echo "(this requires root access)"
cp codebox.desktop /home/$(whoami)/Desktop
sudo chmod +x /home/$(whoami)/Desktop/codebox.desktop
echo ""

echo "Writing desktop menu item"
touch codebox.directory
echo "[Desktop Entry]" >> codebox.directory
echo "Value=1.0" >> codebox.directory
echo "Type=Directory" >> codebox.directory
echo "Encoding=UTF-8" >> codebox.directory
echo "done"
echo ""

echo "Installing to Applications menu"
xdg-desktop-menu install codebox.directory codebox.desktop
xdg-desktop-menu forceupdate
echo ""

echo "Cleaning"
rm codebox.directory codebox.desktop
echo ""

echo "Codebox is now installed on your desktop"