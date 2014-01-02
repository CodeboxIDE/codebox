#!/usr/bin/env node

var _ = require('underscore');
var cli = require('commander');
var pkg = require('../package.json');
var codebox = require("../index.js");

// Command 'run'
cli.command('run [args]')
.description('Run a Codebox into a folder.')
.action(function(projectDirectory) {
    // Codebox.io settings
    this.box = process.env.CODEBOXIO_BOXID;
    this.key = process.env.CODEBOXIO_TOKEN;
    this.codeboxio = process.env.CODEBOXIO_HOST || "https://api.codenow.io";

    this.directory = projectDirectory || process.env.WORKSPACE_DIR || "./";
    this.title = this.title || process.env.WORKSPACE_NAME;

    var config = {
        'root': this.directory,
        'title': this.title
    };

    // Use Codebox
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
    codebox.start(config).fail(function(err) {

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
});

cli.option('-t, --title <title>', 'Title for the project.');

cli.version(pkg.version).parse(process.argv);
if (!cli.args.length) cli.help();

