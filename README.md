# Codebox
> "Open source cloud & desktop IDE."

[![Build Status](https://travis-ci.org/CodeboxIDE/codebox.png?branch=master)](https://travis-ci.org/CodeboxIDE/codebox)
[![NPM version](https://badge.fury.io/js/codebox.svg)](http://badge.fury.io/js/codebox)

#### :warning: Instructions are for the not yet published version 1.0.0

Codebox is a complete and modular Cloud IDE. It can run on any unix-like machine (Linux, Mac OS X). It is an open source component of [codebox.io](https://www.codebox.io) (Cloud IDE as a Service).

The IDE can run on your desktop (Linux or Mac), on your server or the cloud. You can use the [codebox.io](https://www.codebox.io) service to host and manage IDE instances.

Codebox is built with web technologies: `node.js`, `javascript`, `html` and `less`. The IDE possesses a very modular and extensible architecture, that allows you to build your own features with through add-ons. Codebox is the first open and modular IDE capable of running both on the Desktop and in the cloud (with offline support).

The project is open source under the [Apache 2.0](https://github.com/FriendCode/codebox/blob/master/LICENSE) license.
A screencast of the IDE is available on [Youtube](https://www.youtube.com/watch?v=xvPEngyXA2A).

![Image](https://raw.github.com/FriendCode/codebox/master/screenshot.png)

## How to install and run Codebox

#### Desktop Applications

Installers for the latest stable build for **Mac** and **Linux** can be downloaded on the [release page](https://github.com/FriendCode/codebox/releases).

Instructions on how to install it can be found for each release.

#### Install from NPM

Codebox can be installed as a Node package and use programatically or from the command line.

Install Codebox globally using NPM:
```
$ npm install -g codebox
```

And start the IDE from the command line:
```
$ codebox --root=./myworkspace --open
```

Use this command to run and open Codebox IDE. By default, Codebox uses GIT to identify you, you can use the option ```--email=john.doe@gmail.com``` to define the email you want to use during GIT operations.

Other command line options are available and can be list with: ```codebox --help```. For deeper configuration, take a look at the documentation about [environment variables](http://help.codebox.io/ide/env.html).

#### Command line options

```
-h, --help              output usage information
-V, --version           output the version number
-r, --root [path]       Root folder for the workspace, default is current directory
-t, --templates [list]  Configuration templates, separated by commas
-p, --port [port]       HTTP port
```

#### Developing and testing packages

Download and build the source code:

```
$ git clone https://github.com/CodeboxIDE/codebox.git
$ cd ./codebox
$ npm install .
$ grunt
```

Then you can easily link packages for testing by creating a folder that will contains all your packages (each should start with the prefix `package-`), then run the command `grunt link --origin=../mypackages`. This command will create symlinks between all the packages in `../mypackages` and the folder where are stored packages used by codebox.

Everytime you update the code of your package, simply run `grunt resetPkg --pkg=mypackage` in it and restart codebox.

#### Need help?

The IDE's documentation can be found at [help.codebox.io](http://help.codebox.io). Feel free to ask any questions or signal problems by adding issues.

## Helping Codebox

**I want to help with the code:** Codebox accepts pull-requests, please see the [Contributing to Codebox](https://github.com/FriendCode/codebox/blob/master/CONTRIBUTING.md) guide for information on contributing to this project. And don't forget to add your contact information on the AUTHORS list.

**I found a bug:** File it as an [issue](https://github.com/FriendCode/codebox/issues) and please describe as much as possible the bug and the context.

**I have a new suggestion:** For feature requests please first check [the issues list](https://github.com/FriendCode/codebox/issues) to see if it's already there. If not, feel free to file it as an issue and to define the label **enhancement**.

## Contact info

* **Website:** [www.codebox.io](https://www.codebox.io)
* **Twitter:** [@CodeboxIO](https://twitter.com/CodeboxIO)
* **Blog:** [blog.codebox.io](http://blog.codebox.io)
* **Youtube:** [Codebox Channel](http://www.youtube.com/channel/UCWocQwS2VmDS3Ej0LQYWVIw)


