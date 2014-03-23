var os = require("os");
var path = require("path");
var _ = require("lodash");
var Q = require("q");
var spawn = require('child_process').spawn;

var search = function(root, args) {
    var d = Q.defer();
    var results = {};

    var proc = spawn('ack', ['"'+args.query+'"', '--nocolor'], {
        cwd: root,
        env: process.env
    });
    proc.stdout.on('data', function(data) {
        data = data.toString();

        _.each(data.toString().split("\n"), function(line) {
            var parts = line.split(":");
            if (parts.length < 3) return;

            results[parts[0]] = results[parts[0]] || [];
            results[parts[0]].push({
                'line': parts[1],
                'content': parts[2]
            });
        });
    });

    proc.on('error', function(err) {
        d.reject(err)
    });
    proc.on('exit', function(code) {
        d.resolve(results)
    });

    return d.promise;
};

module.exports = search;