# Codebox (:warning: Unstable version)

[![Build Status](https://travis-ci.org/CodeboxIDE/codebox.png?branch=master)](https://travis-ci.org/CodeboxIDE/codebox)


This is an unstable version of the new codebox.

### How to test it?

Download the source code:

```
$ git clone -b new https://github.com/CodeboxIDE/codebox.git
$ cd ./codebox
```

Install dependencies:

```
$ npm install .
```

Build the client:

```
$ grunt
```

And then start the IDE (the first run will download will take some time to download the packages):

```
$ ./bin/codebox.js
```

### Options

```
-h, --help              output usage information
-V, --version           output the version number
-r, --root [path]       Root folder for the workspace, default is current directory
-t, --templates [list]  Configuration templates, separated by commas
-p, --port [port]       HTTP port
```

### Developing and testing packages

You can easily link packages for testing by creating a folder that will contains all your packages (each should start with the prefix `package-`), then run the command `grunt link --origin=../mypackages`. This command will create symlinks between all the packages in `../mypackages` and the folder where are stored packages used by codebox.

Everytime you update the code of your package, simply run `grunt resetPkg --pkg=mypackage` in it and restart codebox.

