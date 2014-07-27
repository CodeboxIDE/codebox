var fs = require("fs");
var path = require("path");
var pkg = require("../../package.json");

// About this current version
var about = function(args) {
    return {
        'version': pkg.version
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
