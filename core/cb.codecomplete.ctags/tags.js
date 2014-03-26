var Q = require('q');
var ctags = require("ctags");
var path = require("path");
var os = require("os");
var fs = require("fs");
var exec = require("../utils").exec;


var execCTags = function(folder, files, output) {
    return exec(
        'echo "'+files.join("\n")+'" | ctags --filter > '+output, {
            cwd: folder
        }
    );
};

var getTags = function(folder, files) {
    var tags = [], tempFile, stream;

    tempFile = path.join(os.tmpDir(), "ctags"+Date.now());

    // Get tags using ctags
    return execCTags(folder, files, tempFile)
    .then(function() {
        var d = Q.defer();
        stream = ctags.createReadStream(tempFile);

        stream.on("data", function(_tags) {
            tags = tags.concat(_tags);
        });

        stream.on("error", function(err) {
            d.reject(err);
        });

        stream.on("end", function() {
            d.resolve();
        });

        return d.promise;
    })
    .then(function() {
        // Remove temp file
        return Q.nfapply(fs.unlink, [tempFile]);
    })
    .then(function() {
        return tags;
    });
};

module.exports = {
    'get': getTags
}