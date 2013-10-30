// Requires
var _ = require('underscore');
var glob = require("glob");
var Q = require('q');


function setup(options, imports, register) {
    // Import
    var vfs = imports.vfs;
    var workspace = imports.workspace;

    // Construct
    var filesSearch = function(args) {
        var d = Q.defer();

        args = _.defaults({}, args || {}, {
            'start': 0,
            'limit': 30
        });

        glob("**/*"+args.query+"*", {
            'cwd': workspace.root
        }, function (err, files) {
            if (err) {
                d.reject(err);
            } else {
                var results = _.map(files.slice(args.start, args.start+args.limit), function(path) {
                    return "/"+path;
                });

                d.resolve({
                    'files': results,
                    'n': _.size(files)
                });
            }
        });

        return d.promise;
    };

    // Register
    register(null, {
        "search": {
            files: filesSearch
        }
    });
}

// Exports
module.exports = setup;
