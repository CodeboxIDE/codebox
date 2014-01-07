# Working Offline

Codebox lets you sync your files offline to keep working when your network is down (or when you're in the plane).

### Downloading files for offline uses

When you open the IDE, it will automatically start downloading all your project in your local machine, this operation can take a few seconds or minutes according to the size of your project. This operation will also be run periodically to keep the local verison updated.

You can also manually run the download operation using the "Synchronize" menu.

### No internet access

The IDE will detect when your internet access is down and switch to offline mode, terminals and some others components will not be available offline. You will be able to edit your file in the same way than online (and also still access this documentation from the IDE).

### Internet is back

When your internet access is back, the IDE will refresh to switch to online mode, it will calculated the changes between your offline modifications and the project. The menu "Changes" will be used to apply offline modifications that you want.

**Caution:** No modifications will be applied automatically.
