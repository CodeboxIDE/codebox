# Managing addons

### Define core addons (defaults addons preinstalled):

You can specify a list of core addons that will be pre-installed int he box and which will not need updates from the user.

Start by defining the env variable WORKSPACE_ADDONS_DEFAULTS with a list of git urls separate with commas. For example for having only the addons manger and teh code editor:

```
WORKSPACE_ADDONS_DEFAULTS=https://github.com/FriendCode/codebox-addon-manager.git,https://github.com/FriendCode/codebox-addon-editor.git
```

### Define addons directories:

Codebox need to directories for managing addons:

* A directory for storing defaults addons: WORKSPACE_ADDONS_DEFAULTS_DIR
* A diretcory for storing all the installed addons: WORKSPACE_ADDONS_DIR

By default, Codebox will store these directories into the 'addons' directory of the repository.
Caution: If the directories doesn't exists, Codebox will recursively create them.

### Forcing last version of defaults addons

When starting Codebox will check if the defaults addons diretcory is empty, if yes it will install from the git repositories the last versions.

### Publish an addon

You can publish an addon for the addon manager by doing a Pull-Request on https://github.com/FriendCode/codebox-addons/blob/master/index.json.