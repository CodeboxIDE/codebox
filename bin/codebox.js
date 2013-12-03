#!/usr/bin/env node
var _ = require('underscore');
var cli = require('commander');
var pkg = require('../package.json');
var codebox = require("../index.js");

// Command 'run'
cli.command('run')
.description('Run a Codebox into a folder.')
.action(function() {
    this.box = this.box || process.env.CODEBOXIO_BOXID;
    this.key = this.key || process.env.CODEBOXIO_TOKEN;
    this.codeboxio = this.codeboxio || process.env.CODEBOXIO_HOST || "https://api.codenow.io";

    this.directory = this.directory || process.env.WORKSPACE_DIR || "./";
    this.title = this.title || process.env.WORKSPACE_NAME;

    var config = {
        'root': this.directory,
        'title': this.title
    };

    // Use Codebox
    if (this.box && this.codeboxio && this.key) {
        _.extend(config, {
            'hooks': {
                'auth': this.codeboxio+"/api/box/"+this.box+"/auth",
                'events': this.codeboxio+"/api/box/"+this.box+"/events",
                'settings': this.codeboxio+"/api/account/settings"
            },
            'webhook': {
                'authToken': this.key
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
    console.log('    $ codebox run -d ./myProject');
    console.log('');
});


cli.option('-d, --directory <path to project directory>', 'Define working directory for the project.');
cli.option('-t, --title <title>', 'Title for the project.');
cli.option('-b, --box <box id>', 'CodeNow Bow to configure for.');
cli.option('-k, --key <web token>', 'CodeNow Bauth token.');
cli.option('-c, --codeboxio <codebox manager host>', 'Codebox host (ex: https://api.codenow.io).');

cli.version(pkg.version).parse(process.argv);
if (!cli.args.length) cli.help();

