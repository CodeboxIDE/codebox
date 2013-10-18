# Codebox

## Installation

```
$ npm install -g git+ssh://git@github.com:FriendCode/codebox.git
```

## Run it for a project

```
$ codebox create --git=...
```

## Environment variables

```
WORKSPACE_NAME=name of the workspace
WORKSPACE_DIR=root dir of the workspace
```

## Add-ons

Add-ons are stored as directory in /addons.

## APIs

The Codebox API is a very simple HTTP RPC API

#### Box

```
box/status
Return Codebox status
```

#### Auth

```
auth/join
Authenticate the user to the Codebox.

Arguments:
	userId: user identifiant
	token: user private token for auth
	name: user display name
	email: user email (for git and display)
	image: user display image
```

