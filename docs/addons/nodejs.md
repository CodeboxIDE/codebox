# Running node.js code in your add-on

Addon can define a node.js module that will be started with Codebox. It uses [engineer](https://github.com/FriendCode/engineer) to load the different components (core and addons).

For example, for the following **package.json**:

```
{
    "name": "test",
    "version": "0.1.0",
    "title": "My Codebox Node Test",
    "main": "main",
    "dependencies": {
        "myNodeModule": "0.2.0"
    },
    "provides": [
        "myTest"
    ],
    "consumes": [
        "rpc"
    ]
}
```

Here is the **main.js**:

```javascript
var myNodeModule = require("myNodeModule");

module.exports = function setup(plugin, imports, register) {
    // Dependencies from others codebox components specified in the package.json are laoded here:
    var rpc = imports.rpc;

    var hello = function(name) {
        return "Hello "+name;
    };

    // Register your component to signal it's ready and ley other access 'myTest':
    register(null, {
        myTest: {
            'hello': hello
        }
    });
};
```

You can use the object provided by all the moduels from the [core](https://github.com/FriendCode/codebox/tree/master/core).


### Important modules

#### RPC

##### Node side

This module allows your add-on to define api method than can be used by the client. Since all RPC methods should return a promise, the module should depends on **q**.

Example:

**package.json**:
```
{
    "name": "helloRPC",
    "version": "0.1.0",
    "title": "HelloWorld RPC method",
    "main": "main",
    "consumes": [
        "rpc"
    ],
    "dependencies": [
        "q": "1.0.0"
    ]
}
```

**main.js**:

```javascript
var Q = require('q');

var HelloService = function() {
    this.lang = "en";
    this.langs = {
        'en': "Hello",
        'fr': "Bonjour"
    };

    // Method starting with _ are not accessible using rpc
    this._getMessage = funciton(name, lang) {
        lang = lang || this.lang;
        return this.langs[lang]+" "+name;
    };

    this.say = function(args) {
        if (!args.name) {
            return Q.reject(new Error("Need argument 'name'"));
        }
        return Q({
            'message': this._getMessage(args.name, args.lang);
        });
    };

    this.lang = function(args) {
        if (!args.lang) {
            return Q.reject(new Error("Need argument 'lang'"));
        }
        if (!this.langs[args.lang]) {
            return Q.reject(new Error("Invalid lang: "+args.lang));
        }
        this.lang = args.lang;
        return Q({
            'lang': this.lang
        });
    };
};

function setup(options, imports, register) {
    var rpc = imports.rpc;

    var service = new HelloService();

    // Register RPC
    rpc.register('/hello', service);

    // Register
    register(null, {});
}

module.exports = setup;
```

You can now in your browser use these rpc methods by accessing: http://localhost:8000/rpc/hello/say?name=Samy and http://localhost:8000/rpc/hello/lang?lang=en

Check out the [Heroku Add-on example](https://github.com/FriendCode/codebox-addon-heroku) for seeing an other example of use of RPC.

##### Client side

To use those methods from your `client.js` file, you just need to require the rpc module and call the `execute` method:

```javascript
var rpc = codebox.require("core/backends/rpc");

rpc.execute("hello/say", {
    "lang": "en"
}).then(function(res) {
    // Request not rejected, do your work here
    console.log(res);
}, function(err) {
    // Handle error here
    console.log(err);
});

```