#! /usr/bin/env node

var codebox = require("../lib");

codebox.start({
    port: 3000
})
.fail(function(err) {
    console.log(err.stack || err.message || err);
});
