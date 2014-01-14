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

#### description

