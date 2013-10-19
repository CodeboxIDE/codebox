# Codebox

## Installation

```
$ npm install -g git+ssh://git@github.com:FriendCode/codebox.git
```

## Command line

Create a new codebox for a project by cloning a git directory

```
$ codebox create [git url]
```

Start a codebox in a directory:

```
$ codebox run -d ./project
```

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

