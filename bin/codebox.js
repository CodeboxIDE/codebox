#! /usr/bin/env node

var path = require("path");
var codebox = require("../lib");

codebox.start({
    port: 3000,
    root: path.resolve(__dirname, "../")
})
.fail(function(err) {
    console.log(err.stack || err.message || err);
});
