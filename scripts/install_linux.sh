#!/bin/bash

# This script need to be stored with content of app release for linux

# Vendor name
VENDOR=friendcode

# User who is running the installer
USER=$(whoami)

# Folder to install codebox too
CODEBOX_PATH=/home/$USER/.codebox

# Folder with codebox files to install
SCRIPTPATH=$(cd -P -- "$(dirname -- "$0")" && pwd -P)

# Removing base folder if already exists
if [ -e $CODEBOX_PATH ]
then
    echo  "Removing old .codebox folder"
    rm -rf $CODEBOX_PATH
    echo ""
fi

# Creating base folder
echo "Creating $CODEBOX_PATH"
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
FILE_DESKTOP=$VENDOR-codebox.desktop
touch $FILE_DESKTOP
echo "[Desktop Entry]" >> $FILE_DESKTOP
echo "Type=Application" >> $FILE_DESKTOP
echo "Encoding=UTF-8" >> $FILE_DESKTOP
echo "Name=Codebox" >> $FILE_DESKTOP
echo "GenericName=Code Editor" >> $FILE_DESKTOP
echo "Comment=Code Editor" >> $FILE_DESKTOP
echo "Exec=$CODEBOX_PATH/Codebox" >> $FILE_DESKTOP
echo "Icon= $CODEBOX_PATH/icon.png"  >> $FILE_DESKTOP
echo "Categories=Development;Utilities;TextEditor" >> $FILE_DESKTOP
echo "Terminal=false" >> $FILE_DESKTOP

echo "Granting the shortcut execution permissions"
echo "(this requires root access)"
cp $FILE_DESKTOP /home/$(whoami)/Desktop
sudo chmod +x /home/$(whoami)/Desktop/$FILE_DESKTOP
echo ""

echo "Writing desktop menu item"
FILE_DIRECTORYENTRY=$VENDOR-codebox.directory
touch $FILE_DIRECTORYENTRY
echo "[Desktop Entry]" >> $FILE_DIRECTORYENTRY
echo "Value=1.0" >> $FILE_DIRECTORYENTRY
echo "Type=Directory" >> $FILE_DIRECTORYENTRY
echo "Encoding=UTF-8" >> $FILE_DIRECTORYENTRY
echo "Name=Codebox" >> $FILE_DIRECTORYENTRY
echo "Comment=Code Editor" >> $FILE_DIRECTORYENTRY
echo "Icon= $CODEBOX_PATH/icon.png"  >> $FILE_DIRECTORYENTRY
echo "done"
echo ""

echo "Installing to Applications menu"
xdg-desktop-menu install $FILE_DIRECTORYENTRY $FILE_DESKTOP
xdg-desktop-menu forceupdate
echo ""

echo "Cleaning"
rm $FILE_DIRECTORYENTRY $FILE_DESKTOP
echo ""

echo "Codebox is now installed on your desktop"