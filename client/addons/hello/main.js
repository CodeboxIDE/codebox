define([], function() {
    var commands = require("core/commands");

    commands.register("helloworld.sayhello", {
        title: "Hello World!",
        icon: "comment"
    }, function() {
        alert("Hello World");
    });
});
