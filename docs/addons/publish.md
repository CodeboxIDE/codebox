# Publish an add-on

You can publish an addon for the addon manager by using the command line tool: [codebox-client](https://github.com/FriendCode/codebox-client)

### Install the command line tool

First of all, install the Codebox.io API client on your machine using:

```
$ npm install codebox-io -g
```

You need now to authorize the client using your API Token (get it in your settings):

```
$ codebox-io auth <your api token>
```

### Publish your add-on

This command will add (or update) your add-on to the Codebox.io main repository. Codebox users will be able to get it using the Addons Manager.

```
$ codebox-io publish ./path/to/the/repository
```

You can also unpublishing it, using:

```
$ codebox-io unpublish ./path/to/the/repository
```
