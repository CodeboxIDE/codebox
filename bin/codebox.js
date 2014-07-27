#! /usr/bin/env node

var _ = require("lodash");
var path = require("path");
var program = require('commander');
var open = require("open");

var pkg = require("../package.json");
var codebox = require("../lib");

var gitconfig = require('../lib/utils/gitconfig');

program
.version(pkg.version)
.option('-r, --root [path]', 'Root folder for the workspace, default is current directory', "./")
.option('-t, --templates [list]', 'Configuration templates, separated by commas', "")
.option('-p, --port [port]', 'HTTP port', 3000)
.option('-o, --open', 'Open the IDE in your favorite browser')
.option('-e, --email [email address]', 'Email address to use as a default authentication')
.option('-u, --users [list users]', 'List of coma seperated users and password (formatted as "username:password")');


program.on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ codebox --root=./myfolder');
    console.log('');
});

program.parse(process.argv);

// Parse auth users
var users = !program.users ? {} : _.object(_.map(program.users.split(','), function(x) {
    // x === 'username:password'
    return x.split(':', 2);
}));

// Generate configration
var options = {
    root: path.resolve(process.cwd(), program.root),
    port: program.port,
    auth: {
        users: users
    }
};


codebox.start(options)
.then(function() {
    if (program.email) return program.email;

    // Path to user's .gitconfig file
    var configPath = path.join(
        process.env.HOME,
        '.gitconfig'
    );

    // Codebox git repo: use to identify the user
    return gitconfig(configPath)
    .get("user")
    .get("email")
    .fail(function() {
        return "";
    });
})
.then(function(email) {
    var token = users[email] || Math.random().toString(36).substring(7);
    var url = "http://localhost:"+program.port;

    console.log("\nCodebox is running at", url);

    if (program.open) open(url+"/auth?email="+email+"&token="+token);
})
.fail(function(err) {
    console.log(err.stack || err.message || err);
});
