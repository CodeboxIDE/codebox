# Codebox
> "Open and Extensible Cloud IDE."

Codebox is a complete and extensible IDE that runs as a workspace. It cans runs on any linux machines.
Codebox is an open-source component of CodeNow (http://codenow.io).

## Why is CodeBox great?

* Easy to run
* Fully web IDE
* 

## How to use it?

First of all install codebox on your machine using npm:

```
$ npm install -g codebox
```

You can now run Codebox into a directory (Codebox can only be run on GIT repository):

```
$ codebox run -d ./myworkspace
```

## Architecture


## How to build an extension?

Extension can currently only run in the client-side. Check out some examples:

* [HelloWorld](https://github.com/FriendCode/codebox-addon-helloworld): Simple HelloWorld Dialog
* [Doks](https://github.com/FriendCode/codebox-addon-doks): Search documentation from search bar
* [Code Editor](https://github.com/FriendCode/codebox-addon-editor): Code Editor using Ace
* [GIT](https://github.com/FriendCode/codebox-addon-git): Interface for managing the GIT repository
* [Terminal](https://github.com/FriendCode/codebox-addon-terminal): Full terminal

