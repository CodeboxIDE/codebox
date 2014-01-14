# Build Client-Side Add-ons

Client add-ons need to define the ```client``` field according to [the manifest documentation](package.md).

Example:

```json
{
    "name": "helloworld",
    "version": "0.1.0",
    "title": "HelloWorld",
    "client": {
        "main": "client"
    }
}
```

Client-side part of IDE is built using:

* [HappyRhino.js](https://friendco.de/hr.js/): A framework for building large client-side application
* [Require.js](http://requirejs.org/)
* [Less](http://lesscss.org/)

Here is a standard main entry for our add-on:

```javascript
define([], function() {
    // Require some core components
    var menu = codebox.require("core/commands/menu");
    var dialogs = codebox.require("utils/dialogs");

    menu.register("helloworld", {
        title: "Hello"
    }).menuSection({
        title: "Say Hello!",
        action: function() {
            dialogs.alert("Hello World", "Hey, this is a message from an add-on!");
        }
    });
});
```

All the component from the [core](https://github.com/FriendCode/codebox/tree/master/client) are accesible using ```codebox.require```.
