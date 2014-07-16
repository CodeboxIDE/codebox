#! /usr/bin/env node

var codebox = require("../lib");

codebox.start({
    port: 3000
})
.then(function() {
    console.log("Codebox is running");
}, function(err) {
    console.log(err.stack || err.message || err);
});
