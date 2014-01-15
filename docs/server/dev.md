# Run Codebox from source

If you wan to contribute on Codebox and run it from source to easily test your changes, this article is here to help you.

No need to use the ```grunt``` command, simply fill a **.env** file in the root source code directory with:

```
#!/bin/bash
# Will force the rebuild of all the add-ons and avoid client cache
export DEV=true
export CLIENT_DEBUG=true

# Others configurations
export WORKSPACE_NAME=test
export WORKSPACE_PUBLIC=false
export WORKSPACE_USERS_MAX=3
export WORKSPACE_ADDONS_DIR=/Users/samypesse/Desktop/Projects/CodeBox/addons
export WORKSPACE_DIR=/Users/samypesse/Desktop/Projects/CodeBox/examples/node-js-sample
```

Get a full list of environment variables in this [article](./env.md).

When your **.env** file is ready, simply run:

```
$ npm start
```

It will read the environment variables from the .env and start the build + run process.