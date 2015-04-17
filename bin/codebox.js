#! /usr/bin/env node

var _ = require("lodash");
var path = require("path");
var program = require('commander');
var open = require("open");

var pkg = require("../package.json");
var codebox = require("../lib");

var gitconfig = require('../lib/utils/gitconfig');

function printError(err) {
    console.log(err.stack || err.message || err);
}

program
.version(pkg.version)
.on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ codebox ./myfolder');
    console.log('');
});

//// Run Codebox
////
program
.command('run [root]')
.description('run codebox')
.option('-t, --templates [list]', 'Configuration templates, separated by commas', "")
.option('-p, --port [port]', 'HTTP port', 3000)
.option('-o, --open', 'Open the IDE in your favorite browser')
.option('-e, --email [email address]', 'Email address to use as a default authentication')
.option('-u, --users [list users]', 'List of coma seperated users and password (formatted as "username:password")', function (val) {
    return _.object(_.map((val || "").split(','), function(x) {
        // x === 'username:password'
        return x.split(':', 2);
    }));
}, {})
.action(function(root, opts) {
    // Generate configration
    var options = {
        root: path.resolve(process.cwd(), root || "./"),
        port: opts.port,
        auth: {
            users: opts.users
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

        if (program.open) open(url+"/?email="+email+"&token="+token);
    })
    .fail(printError);
});

//// Install packages
////
program
.command('install')
.description('pre-install packages')
.option('-r, --root [path]', 'Root folder to store packages')
.option('-p, --packages <items>', 'Comma separated list of packages to install', function (val) {
    return _.chain(val.split(","))
        .compact()
        .map(function(pkgref) {
            var parts = pkgref.split(":");
            var name = _.first(parts);
            var url = parts.slice(1).join(":");
            if (!name || !url) throw "Packages need to be formatted as 'name:url'";

            return [name,url];
        })
        .object()
        .value()
}, [])
.action(function(opts) {
    codebox.prepare({
        packages: {
            root: opts.root? path.resolve(process.cwd(), opts.root) : undefined,
            install: opts.packages,
            defaults: null
        }
    })
    .then(function() {
        process.exit(0);
    })
    .fail(printError);
});

program.parse(process.argv);

