#!/usr/bin/env node

var _ = require('underscore');
var cli = require('commander');
var open = require("open");

var pkg = require('../package.json');
var codebox = require("../index.js");

// Options
cli.option('-p, --port [http port]', 'Port to run the IDE');
cli.option('-t, --title [project title]', 'Title for the project.');
cli.option('-o, --open', 'Open the IDE in your favorite browser')

// Command 'run'
cli.command('run [folder]')
.description('Run a Codebox into a specific folder.')
.action(function(projectDirectory) {
    var that = this;

    // Codebox.io settings
    this.box = process.env.CODEBOXIO_BOXID;
    this.key = process.env.CODEBOXIO_TOKEN;
    this.codeboxio = process.env.CODEBOXIO_HOST || "https://api.codebox.io";

    // Default options
    this.directory = projectDirectory || process.env.WORKSPACE_DIR || "./";
    this.title = this.title || process.env.WORKSPACE_NAME;
    this.port = this.port || process.env.PORT || 8000;


    var config = {
        'root': this.directory,
        'title': this.title,
        'server': {
            'port': parseInt(this.port)
        }
    };

    // Use Codebox.io
    if (this.box && this.codeboxio && this.key) {
        _.extend(config, {
            'workspace': {
                'id': this.box
            },
            'hooks': {
                'auth': this.codeboxio+"/api/box/"+this.box+"/auth",
                'events': this.codeboxio+"/api/box/"+this.box+"/events",
                'settings': this.codeboxio+"/api/account/settings"
            },
            'webhook': {
                'authToken': this.key
            },
            'proc': {
                'urlPattern': 'http://web-%d.' + this.box + '.vm1.dynobox.io'
            }
        });
    }

    // Start Codebox
    codebox.start(config).then(function() {
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
});

cli.on('--help', function(){
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
