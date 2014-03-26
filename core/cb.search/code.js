var os = require("os");
var path = require("path");
var _ = require("lodash");
var Q = require("q");
var spawn = require('child_process').spawn;

var types = require("./types");

var config = {
    grepCmd: "grep",
    perlCmd: "perl",
    platform: os.platform()
};

var assembleCommand = function(options) {
    var include = "";
    var cmd = config.grepCmd + " -s -r --color=never --binary-files=without-match -n " +
        (!options.casesensitive ? "-i " : "") +
        (process.platform != "darwin" ? "-P " : "");

    if (options.pattern) { // handles grep peculiarities with --include
        if (options.pattern.split(",").length > 1)
            include = "{" + options.pattern + "}";
        else
            include = options.pattern;
    }
    else {
        include = (process.platform != "darwin" ? "\\" : "") + "*{" + types.PATTERN_EXT + "}";
    }

    if (options.maxresults)
        cmd += "-m " + parseInt(options.maxresults, 10);
    if (options.wholeword)
        cmd += " -w";

    var query = options.query;
    if (!query)
        return;

    // grep has a funny way of handling new lines (that is to say, it's non-existent)
    // if we're not doing a regex search, then we must split everything between the
    // new lines, escape the content, and then smush it back together; due to
    // new lines, this is also why we're  now passing -P as default to grep
    if (!options.replaceAll && !options.regexp) {
        var splitQuery = query.split("\\n");

        for (var q in splitQuery) {
            splitQuery[q] = types.grepEscapeRegExp(splitQuery[q]);
        }
        query = splitQuery.join("\\n");
    }

    query = query.replace(new RegExp("\\\'", "g"), "'\\''"); // ticks must be double escaped for BSD grep

    cmd += " " + types.PATTERN_EDIR + " " +
           " --include=" + include +
           " '" + query.replace(/-/g, "\\-") + "'" +
           " \"" + types.escapeShell(options.path) + "\"";

    if (options.replaceAll) {
        if (!options.replacement)
            options.replacement = "";

        if (options.regexp)
            query = types.escapeRegExp(query);

        // pipe the grep results into perl
        cmd += " -l | xargs " + config.perlCmd +
        // print the grep result to STDOUT (to arrange in parseSearchResult())
        " -pi -e 'print STDOUT \"$ARGV:$.:$_\""     +
        // do the actual replace
        " if s/" + query + "/" + options.replacement + "/mg" + ( options.casesensitive ? "" : "i" ) + ";'";
    }

    var args = ["-c", cmd];
    args.command = "bash";
    return args;
};


var search = function(root, args) {
    var d = Q.defer(), prevfile = null;
    var results = {};
    var nMatches = 0;

    args = _.defaults(args || {}, {
        path: "/",

        pattern: null,
        casesensitive: false,
        maxresults: null,
        wholeword: false,
        regexp: null,

        // replace
        replaceAll: false,
        replacement: null
    });

    if (!args.query) return Q.reject(new Error("Need a query to search for code"));

    var _path = path.join(root, args.path);
    if (_path.indexOf(root) !== 0) _path = root;
    
    var command = assembleCommand(_.extend({}, args, {
        path: _path
    }));

    var proc = spawn(command.command, command);
    proc.stdout.on('data', function(data) {
        data = data.toString();
        var lines = data.toString().split(/([\n\r]+)/g);

        for (var i = 0, l = lines.length; i < l; ++i) {
            var parts = lines[i].split(":");
            if (parts.length < 3) continue;

            var _path = path.normalize(parts.shift().replace(root, "").trimRight());
            var _line = parseInt(parts.shift());
            if (!_line) {
                if (prevfile) {
                    results[prevfile][results[prevfile].length - 1].content += "\n\r"+lines[i];
                }
                continue;
            }

            prevfile = _path;
            results[_path] = results[_path] || [];
            results[_path].push({
                'line': _line,
                'content': parts.join(":")
            });
            nMatches = nMatches + 1;
        }
    });

    proc.on('error', function(err) {
        d.reject(err)
    });
    proc.on('exit', function(code) {
        d.resolve({
            'code': code,
            'options': args,
            'files': results,
            'matches': nMatches
        });
    });

    return d.promise;
};

module.exports = search;