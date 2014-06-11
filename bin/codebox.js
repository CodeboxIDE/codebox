#!/usr/bin/env node

var Q = require('q');
var _ = require('lodash');
var cli = require('commander');
var path = require('path');
var open = require("open");
var Gittle = require('gittle');

var pkg = require('../package.json');
var codebox = require("../index.js");

// Codebox git repo: use to identify the user
var codeboxGitRepo = new Gittle(path.resolve(__dirname, ".."));

// Options
cli.option('-p, --port [http port]', 'Port to run the IDE');
cli.option('-n, --hostname [http hostname]', 'Hostname to run the IDE');
cli.option('-t, --title [project title]', 'Title for the project.');
cli.option('-s, --sample [project type]', 'Replace directory content by a sample (warning: erase content).');
cli.option('-o, --open', 'Open the IDE in your favorite browser');
cli.option('-e, --email [email address]', 'Email address to use as a default authentication');
cli.option('-u, --users [list users]', 'List of coma seperated users and password (formatted as "username:password")');


// An authentication hook that uses a dictionary of users
function usersAuthHook(users) {
    return function(data) {
        if (!data.email || !data.token) {
            return Q.reject(new Error("Need 'token' and 'email' for auth hook"));
        }

        var userId = data.email;

        if (!users[userId] || data.token != users[userId]) {
            return Q.reject(new Error("Invalid user !"));
        }

        return {
            'userId': userId,
            'name': userId,
            'token': data.token,
            'email': data.email
        };
    };
}

// Command 'run'
cli.command('run [folder]')
.description('Run a Codebox into a specific folder.')
.action(function(projectDirectory) {
    var that = this;
    var prepare = Q();

    // Codebox.io settings
    that.box = process.env.CODEBOXIO_BOXID;
    that.key = process.env.CODEBOXIO_TOKEN;
    that.codeboxio = process.env.CODEBOXIO_HOST || "https://api.codebox.io";

    // Default options
    that.directory = projectDirectory || process.env.WORKSPACE_DIR || "./";
    that.title = that.title || process.env.WORKSPACE_NAME;
    that.port = that.port || process.env.PORT || 8000;
    that.hostname = that.hostname || "0.0.0.0";

    var users = !that.users ? {} : _.object(_.map(that.users.split(','), function(x) {
        // x === 'username:password'
        return x.split(':', 2);
    }));


    var config = {
        'root': that.directory,
        'title': that.title,
        'server': {
            'port': parseInt(that.port),
            'hostname': that.hostname
        },
        'users': {
            'defaultEmail': that.email
        },
        'project': {
            'forceSample': that.sample
        }
    };

    // Use Codebox.io
    if (that.box && that.codeboxio && that.key) {
        _.extend(config, {
            'workspace': {
                'id': that.box
            },
            'hooks': {
                'auth': that.codeboxio+"/api/box/"+that.box+"/auth",
                'events': that.codeboxio+"/api/box/"+that.box+"/events",
                'settings': that.codeboxio+"/api/account/settings",
                'addons': that.codeboxio+"/api/addons/valid"
            },
            'webhook': {
                'authToken': that.key
            },
            'proc': {
                'urlPattern': 'http://web-%d.' + that.box + '.vm1.dynobox.io'
            },
            'users': {
                // Don't use default git user
                'gitDefault': false
            }
        });
    } else if(!_.isEmpty(users)) {
        _.extend(config, {
            'public': false,
            'hooks': {
                'auth': usersAuthHook(users)
            }
        });
    }

    // Auth user using git
    prepare.fin(function() {
        // Start Codebox
        return codebox.start(config).then(function() {
            var url = "http://localhost:"+that.port;

            console.log("\nCodebox is running at",url);

            if (that.open) {
                open(url);
            }
        }, function(err) {
            console.error('Error initializing CodeBox');
            console.error(err);
            console.error(err.stack);

            // Kill process
            process.exit(1);
        });
    })
});

cli.on('--help', function(){
    console.log('  Version: %s', pkg.version);
    console.log('');
    console.log('  Examples:');
    console.log('');
    console.log('    $ codebox run');
    console.log('    $ codebox run ./myProject');
    console.log('');
    console.log('    Use option --open to directly open the IDE in your browser:');
    console.log('    $ codebox run ./myProject --open');
    console.log('');
});

cli.version(pkg.version).parse(process.argv);
if (!cli.args.length) cli.help();
