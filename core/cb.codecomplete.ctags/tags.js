var Q = require('q');
var ctags = require("ctags");
var path = require("path");
var os = require("os");
var fs = require("fs");
var exec = require("../utils").exec;


var execCTags = function(folder, output) {
    return exec(
        'find '+folder+' | grep -v "/node_modules/" | grep -v "/\\.git/" | ' +
         'ctags --filter > '+output
    );
};

var getTags = function(folder) {
    var _tags, tempFile;

    tempFile = path.join(os.tmpDir(), "ctags"+Date.now());

    // Get tags using ctags
    return execCTags(folder, tempFile).then(function() {
        _tags = ctags.getTags(tempFile);

        // Remove temp file
        return Q.nfapply(fs.unlink, [tempFile]);
    }).then(function() {
        return _tags;
    });
};

module.exports = {
    'get': getTags
}