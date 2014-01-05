# Managing addons

### Define addons directories:

Codebox need two directories for managing addons:

* A directory for storing defaults addons: WORKSPACE\_ADDONS\_DEFAULTS_DIR (don't change if you don't know what you're doing)
* A directory for storing all the installed addons: WORKSPACE\_ADDONS\_DIR
* A directory for storing temporary data: WORKSPACE\_ADDONS\_TEMP\_DIR

WORKSPACE\_ADDONS\_DEFAULTS\_DIR will be access in read-only mode but WORKSPACE\_ADDONS\_DIR need write permissions.

By default, Codebox will store the new addons into **.addons**.
Caution: If the directory doesn't exists, Codebox will recursively create it.
