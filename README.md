# Codebox
> "Open source cloud & desktop IDE."

Codebox is a complete and modular Cloud IDE. It can run on any unix-like machine (Linux, Mac OS X). It is an open source component of [codebox.io](https://www.codebox.io) (Cloud IDE as a Service).

The IDE can run on your desktop (Linux or Mac), on your server or the cloud. You can use the [codebox.io](https://www.codebox.io) service to host and manage IDE instances.

Codebox is built with web technologies: `node.js`, `javascript`, `html` and `less`. The IDE possesses a very modular and extensible architecture, that allows you to build your own features with through add-ons. Codebox is the first open and modular IDE capable of running both on the Desktop and in the cloud (with offline support).

The project is open source under the [Apache 2.0](https://github.com/FriendCode/codebox/blob/master/LICENSE) license.
A screencast of the IDE is available on [Youtube](https://www.youtube.com/watch?v=xvPEngyXA2A).

![Image](https://github.com/FriendCode/codebox/blob/master/docs/assets/base.png?raw=true)

## How to install and run Codebox

#### Install

Install Codebox globally using NPM:
```
npm install -g codebox
```

##### Ubuntu (extra steps).

On ubuntu you'll need `git` and `build-essential`, install them with:
```
sudo apt-get -y install git build-essential
```

You will also need to install via `npm` using `sudo` with the following:
```
sudo npm install -g codebox
```

Note: Please be aware that some npm libraries may be outdated and require old binary name ```node```, which you can fix by creating a symlink to ```nodejs``` with:

```
sudo ln -s /usr/bin/nodejs /usr/bin/node
```

Desktop binaries for Mac and Linux are **coming soon**.

#### Usage

```
codebox run ./myworkspace --open
```

Use this command to run and open Codebox IDE. By default, Codebox uses GIT to identify you, you can use the option ```--email=john.doe@gmail.com``` to define the email you want to use during GIT operations.

Others comand line options are available and can be list with: ```codebox --help```. For deeper configuration, take a look at the documentation about [environment variables](https://github.com/FriendCode/codebox/blob/master/docs/server/env.md).

#### Need help?

The IDE's documentation can be found in the [docs](../master/docs) folder. Feel free to ask any questions or signal problems by adding issues.

## Helping Codebox

**I want to help with the code:** Codebox accepts pull-requests, please see the [Contributing to Codebox](https://github.com/FriendCode/codebox/blob/master/CONTRIBUTING.md) guide for information on contributing to this project. And don't forget to add your contact informations on the AUTHORS list.

**I found a bug:** File it as an [issue](https://github.com/FriendCode/codebox/issues) and please describe as much as possible the bug and the context.

**I have a new suggestion:** For feature requests please first check [the issues list](https://github.com/FriendCode/codebox/issues) to see if it's already there. If not, feel free to file it as an issue and to define the label **enhancement**.

## Contact info

* **Website:** [www.codebox.io](https://www.codebox.io)
* **Twitter:** [@CodeboxIO](https://twitter.com/CodeboxIO)
* **Blog:** [blog.codebox.io](http://blog.codebox.io)
* **Youtube:** [Codebox Channel](http://www.youtube.com/channel/UCWocQwS2VmDS3Ej0LQYWVIw)
