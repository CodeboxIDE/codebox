var fs = require("fs");
var path = require("path");
var pkg = require("../../package.json");

var workspace = require('../workspace');

// About this current version
var about = function(args) {
    return {
    	'id': workspace.config('id'),
    	'title': workspace.config('title'),
        'version': pkg.version,
        'debug': workspace.config('debug')
    };
};

// Releases Notes
var changes = function(args) {
    return {
        'content': fs.readFileSync(path.resolve(__dirname, "../../CHANGES.md")).toString()
    };
};

module.exports = {
    'about': about,
    'changes': changes
};
