#!/usr/bin/env node
var cli = require('commander');
var pkg = require('../package.json');
var codebox = require("../index.js");

// Command 'run'
cli.command('run')
.description('Run a Codebox into a folder.')
.action(function() {
    var path = this.directory || "./";

    codebox.start({
        'root': path,
        'title': this.title
    }).fail(function(err) {

        console.error('Error initializing CodeBox');
        console.error(err);
        console.error(err.stack);

        // Kill process
        process.exit(1);
    });
});

// Command 'create'
cli.command('create [git]')
.description('Create a new codebox from a git repository.')
.action(function(gitUrl) {
    
});

cli.on('--help', function(){
    console.log('  Examples:');
    console.log('');
    console.log('    $ codebox run -d ./myProject');
    console.log('    $ codebox create https://github.com/FriendCode/codebox.git');
    console.log('');
});


cli.option('-d, --directory <path to project directory>', 'Define working directory for the project.');
cli.option('-t, --title <title>', 'Title for the project.');

cli.version(pkg.version).parse(process.argv);
if (!cli.args.length) cli.help();

