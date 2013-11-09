# Managing addons

### Define addons directories:

Codebox need two directories for managing addons:

* A directory for storing defaults addons: WORKSPACE_ADDONS_DEFAULTS_DIR (don't change if you don't know what you're doing)
* A directory for storing all the installed addons: WORKSPACE_ADDONS_DIR
* A directory for storing temporary data: WORKSPACE_ADDONS_TEMP_DIR

WORKSPACE_ADDONS_DEFAULTS_DIR will be access in read-only mode but WORKSPACE_ADDONS_DIR need write permissions.

By default, Codebox will store the new addons into **.addons**.
Caution: If the directory doesn't exists, Codebox will recursively create it.


### Publish an addon

You can publish an addon for the addon manager by using the command line tool: https://github.com/FriendCode/codebox-client

```
$ codenow-io publish ./path/to/the/repository
```

And also unpublish the addon:

```
$ codenow-io unpublish ./path/to/the/repository
```