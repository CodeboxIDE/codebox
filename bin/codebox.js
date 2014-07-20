#! /usr/bin/env node

var path = require("path");
var program = require('commander');

var pkg = require("../package.json");
var codebox = require("../lib");

program
.version(pkg.version)
.option('-r, --root [path]', 'Root folder for the workspace, default is current directory', "./")
.option('-t, --templates [list]', 'Configuration templates, separated by commas', "")
.option('-p, --port [port]', 'HTTP port', 3000)


program.on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ codebox --root=./myfolder');
    console.log('');
});

program.parse(process.argv);

// Generate configration
var options = {
    root: path.resolve(process.cwd(), program.root),
    port: program.port
};


codebox.start(options)
.fail(function(err) {
    console.log(err.stack || err.message || err);
});
