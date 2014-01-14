# Get started with Addons development

Addons in Codebox are designed to extend functionnalities of the IDE. The core of Codebox is limited to contains only the structure of the IDE: UI components (tabs, menus, panels), Boot process, Addons management, Files Management (The core source code is available at: [node.js core](https://github.com/FriendCode/codebox/tree/master/core) and [client core](https://github.com/FriendCode/codebox/tree/master/client).


Most of the IDE functionnalities are conserved in the defaults addons. These addons are stored in [addons folder](https://github.com/FriendCode/codebox/tree/master/addons) and all start with "cb.".

Addons can extend the client and the node process. Addons structure is based on a node.js package structure. Addon code should be stored in a GIT (GIT is used for downlaoding the addon's code during the installation).

### Writting an HelloWorld Addons

The best way for developing addons is to install Codebox locally and run it an adapted configuration.

1) Create a GIT repository for your add-on (for example on GitHub or Bitbucket)

2) Open a **.env** file in the Codebox directory and add the following [environment variables](../server/env.md):

```
export DEV=true
export WORKSPACE_ADDONS_DIR=/Users/You/codebox/addons  # change it for a directory outside the codebox directory
```

3) Start codebox with these variables using:

```
$ npm start
```

4) Use your Codebox Addons Manager to install the [Hello World Addons](https://github.com/FriendCode/codebox-addon-helloworld).

5) Change the name of the "hello" folder, the name of the package in **package.json" and the git remote url to your repository uing:

```
$ git remote set-url origin https://github.com/user/repo2.git
```

6) Restart Codebox using ```$ npm start``` and you just finished your first HelloWorld add-on!

### Writting your add-on

* [Structure of the package.json](package.md)
* [Running node.js code](nodejs.md)
* [Running client code](client.md)

