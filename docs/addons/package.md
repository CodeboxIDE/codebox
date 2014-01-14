# Manifest format

Every add-on package should contain a manifest file named **package.json**, it will tell Codebox how to use this add-on.

**package.json** should be written in the format of JSON.

Example:

```
{
    "name": "helloworld",
    "version": "0.1.0",
    "title": "HelloWorld",
    "description": "Hello World addon for CodeBox",
    "homepage": "https://github.com/FriendCode/codebox-addon-helloworld",
    "license": "Apache",
    "author": {
        "name": "Samy Pessé",
        "email": "samypesse@gmail.com",
        "url": "http://samypesse.fr"
    },
    "client": {
        "main": "client"
    }
}
```

### Required Fields

#### name

(string) the name of the package. This must be a unique, lowercase alpha-numeric name without spaces. It may include "." or "_" or "-" characters. It is otherwise opaque.

name should be globally unique since Codebox will store addon's data under the directory named name.

#### title

(string) complete name for this add-on.

#### version

(string) version for the addon, format should be : X.X.X, comparaison are done by converting A.B.C to the int ABC.

#### author

(object) information about he add-on author, example:

```
{
    "name": "Samy Pessé",
    "email": "samypesse@gmail.com",
    "url": "http://samypesse.fr"
}
```

### Fields

#### description

(string) Descript of the add-on to display in the add-ons manager.

### homepage

(string) The url to the project homepage.

#### engines

(object) You can specify the version of Codebox that your stuff works on:

```
{ "engines" : { "codebox" : ">=0.4.0" } }
```

#### client

(object) If your add-on need to run some component on the client, it should contain a ```main``` key, you can also defined in the same way that for [engineer](https://github.com/FriendCode/engineer) the dependencies.

```
{
    "client" : {
        "main": "client",
        "provides": [
            "my_object"
        ],
        "consumes": [
            "other_object"
        ]
    }
}
```

You can caches resources for offline use by using the key ```resources``` (it supports glob):

```
{
    "client" : {
        "main": "client",
        "resources": [
            "images/**"
        ]
    }
}
```

#### main

(string) The main field is a module ID that is the node primary entry point to your add-on. 

#### dependencies

(object) Node dependencies are specified with a simple hash of package name to version range (just like for NPM package). The version range is a string which has one or more space-separated descriptors. Dependencies can also be identified with a tarball or git URL.
