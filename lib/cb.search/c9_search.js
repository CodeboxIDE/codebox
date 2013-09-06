/**
 * Search module for the Cloud9 IDE
 *
 * @copyright 2012, Ajax.org B.V.
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */

"use strict";

var Os = require("os");
var Path = require("path");

module.exports = function() {
    this.env = {
        grepCmd: "grep",
        perlCmd: "perl",
        platform: Os.platform(),
        basePath: ""
    };

    this.setEnv = function(newEnv) {
        var self = this;
        Object.keys(this.env).forEach(function(e) {
            if (newEnv[e])
                self.env[e] = newEnv[e];
        });
    };

    this.exec = function(options, vfs, onData, onExit) {
        var path = options.path;

        if (options.path === null)
            return true;

        options.uri = path;
        options.path = Path.normalize(this.env.basePath + (path ? "/" + path : ""));
        // if the relative path FROM the workspace directory TO the requested path
        // is outside of the workspace directory, the result of Path.relative() will
        // start with '../', which we can trap and use:
        if (Path.relative(this.env.basePath, options.path).indexOf("../") === 0)
            return false;

        var args = this.assembleCommand(options);

        if (!args)
            return false;

        this.options = options;
        var self = this;

        if (this.activeProcess)
            this.activeProcess.kill("SIGKILL");

        vfs.spawn(args.command, { args: args, cwd: options.path, stdoutEncoding: "utf8", stderrEncoding: "utf8" }, function(err, meta) {
            if (err || !meta.process)
                return onExit(1, err, {
                    count: 0,
                    filecount: 0
                });

            var child = meta.process;
            self.activeProcess = child;

            var stderr = "";
            var prevFile = null;
            var filecount = 0;
            var count = 0;

            child.stdout.on("data", function(data) {
                var msg = self.parseResult(prevFile, options, data);
                count += msg.count;
                filecount += msg.filecount;
                prevFile = msg.prevFile;

                if (msg)
                    onData(msg);
            });

            child.stderr.on("data", function(data) {
                stderr += data;
            });

            child.on("exit", function(code) {
                self.processCount -= 1;
                onExit(code, stderr, {
                    count: count,
                    filecount: filecount
                });
            });
        });

        return true;
    };

    this.assembleCommand = function(options) {
        var include = "";
        var cmd = this.env.grepCmd + " -s -r --color=never --binary-files=without-match -n " +
            (!options.casesensitive ? "-i " : "") +
            (process.platform != "darwin" ? "-P " : "");

        if (options.pattern) { // handles grep peculiarities with --include
            if (options.pattern.split(",").length > 1)
                include = "{" + options.pattern + "}";
            else
                include = options.pattern;
        }
        else {
            include = (process.platform != "darwin" ? "\\" : "") + "*{" + PATTERN_EXT + "}";
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
                splitQuery[q] = grepEscapeRegExp(splitQuery[q]);
            }
            query = splitQuery.join("\\n");
        }

        query = query.replace(new RegExp("\\\'", "g"), "'\\''"); // ticks must be double escaped for BSD grep

        cmd += " --exclude=*{" + PATTERN_EDIR + "}*" +
               " --include=" + include +
               " '" + query.replace(/-/g, "\\-") + "'" +
               " \"" + escapeShell(options.path) + "\"";

        if (options.replaceAll) {
            if (!options.replacement)
                options.replacement = "";

            if (options.regexp)
                query = escapeRegExp(query);

            // pipe the grep results into perl
            cmd += " -l | xargs " + this.env.perlCmd +
            // print the grep result to STDOUT (to arrange in parseSearchResult())
            " -pi -e 'print STDOUT \"$ARGV:$.:$_\""     +
            // do the actual replace
            " if s/" + query + "/" + options.replacement + "/mg" + ( options.casesensitive ? "" : "i" ) + ";'";
        }

        var args = ["-c", cmd];
        args.command = "bash";
        return args;
    };

    this.parseResult = function(prevFile, options, data) {
        if (typeof data !== "string" || data.indexOf("\n") === -1)
            return { count: 0, filecount: 0, data: "" };

        var parts, file, lineno, result = "";
        var aLines = data.split(/([\n\r]+)/g);
        var count = 0;
        var filecount = 0;

        if (options) {
            for (var i = 0, l = aLines.length; i < l; ++i) {
                parts = aLines[i].split(":");

                if (parts.length < 3)
                    continue;

                var _path = parts.shift().replace(options.path, "").trimRight();
                file = encodeURI(options.uri + _path, "/");

                lineno = parseInt(parts.shift(), 10);
                if (!lineno)
                    continue;

                ++count;
                if (file !== prevFile) {
                    ++filecount;
                    if (prevFile)
                        result += "\n \n";

                    result += file + ":";
                    prevFile = file;
                }

                result += "\n\t" + lineno + ": " + parts.join(":");
            }
        }
        else {
            console.error("options object doesn't exist", data);
        }

        return {
            count: count,
            filecount: filecount,
            prevFile: prevFile,
            data: result
        };
    };

    // util
    var makeUnique = function(arr){
        var i, length, newArr = [];
        for (i = 0, length = arr.length; i < length; i++) {
            if (newArr.indexOf(arr[i]) == -1)
                newArr.push(arr[i]);
        }

        arr.length = 0;
        for (i = 0, length = newArr.length; i < length; i++)
            arr.push(newArr[i]);

        return arr;
    };

    var escapeRegExp = function(str) {
        return str.replace(/([.*+?\^${}()|\[\]\/\\])/g, "\\$1");
    };

    // taken from http://xregexp.com/
    var grepEscapeRegExp = function(str) {
        return str.replace(/[[\]{}()*+?.,\\^$|#\s"']/g, "\\$&");
    };

    var escapeShell = function(str) {
        return str.replace(/([\\"'`$\s\(\)<>])/g, "\\$1");
    };

    // file types

    var IGNORE_DIRS = {
        ".bzr"              : "Bazaar",
        ".cdv"              : "Codeville",
        "~.dep"             : "Interface Builder",
        "~.dot"             : "Interface Builder",
        "~.nib"             : "Interface Builder",
        "~.plst"            : "Interface Builder",
        ".git"              : "Git",
        ".hg"               : "Mercurial",
        ".pc"               : "quilt",
        ".svn"              : "Subversion",
        "_MTN"              : "Monotone",
        "blib"              : "Perl module building",
        "CVS"               : "CVS",
        "RCS"               : "RCS",
        "SCCS"              : "SCCS",
        "_darcs"            : "darcs",
        "_sgbak"            : "Vault/Fortress",
        "autom4te.cache"    : "autoconf",
        "cover_db"          : "Devel::Cover",
        "_build"            : "Module::Build",
    };

    var MAPPINGS = {
        "actionscript": ["as", "mxml"],
        "ada"         : ["ada", "adb", "ads"],
        "asm"         : ["asm", "s"],
        "batch"       : ["bat", "cmd"],
        //"binary"      : q{Binary files, as defined by Perl's -B op (default: off)},
        "cc"          : ["c", "h", "xs"],
        "cfmx"        : ["cfc", "cfm", "cfml"],
        "clojure"     : ["clj"],
        "cpp"         : ["cpp", "cc", "cxx", "m", "hpp", "hh", "h", "hxx"],
        "csharp"      : ["cs"],
        "css"         : ["css", "less", "scss", "sass"],
        "coffee"      : ["coffee"],
        "elisp"       : ["el"],
        "erlang"      : ["erl", "hrl"],
        "fortran"     : ["f", "f77", "f90", "f95", "f03", "for", "ftn", "fpp"],
        "haskell"     : ["hs", "lhs"],
        "hh"          : ["h"],
        "html"        : ["htm", "html", "shtml", "xhtml"],
        "jade"        : ["jade"],
        "java"        : ["java", "properties"],
        "groovy"      : ["groovy"],
        "js"          : ["js"],
        "json"        : ["json"],
        "latex"       : ["latex", "ltx"],
        "jsp"         : ["jsp", "jspx", "jhtm", "jhtml"],
        "lisp"        : ["lisp", "lsp"],
        "logiql"      : ["logic", "lql"],
        "lua"         : ["lua"],
        "make"        : ["makefile", "Makefile"],
        "mason"       : ["mas", "mhtml", "mpl", "mtxt"],
        "markdown"    : ["md", "markdown"],
        "objc"        : ["m", "h"],
        "objcpp"      : ["mm", "h"],
        "ocaml"       : ["ml", "mli"],
        "parrot"      : ["pir", "pasm", "pmc", "ops", "pod", "pg", "tg"],
        "perl"        : ["pl", "pm", "pod", "t"],
        "php"         : ["php", "phpt", "php3", "php4", "php5", "phtml"],
        "plone"       : ["pt", "cpt", "metadata", "cpy", "py"],
        "powershell"  : ["ps1"],
        "python"      : ["py"],
        "rake"        : ["rakefile"],
        "ruby"        : ["rb", "ru", "rhtml", "rjs", "rxml", "erb", "rake", "gemspec"],
        "scala"       : ["scala"],
        "scheme"      : ["scm", "ss"],
        "shell"       : ["sh", "bash", "csh", "tcsh", "ksh", "zsh"],
        //"skipped"     : "q"{"Files but not directories normally skipped by ack ("default": "off")},
        "smalltalk"   : ["st"],
        "sql"         : ["sql", "ctl"],
        "tcl"         : ["tcl", "itcl", "itk"],
        "tex"         : ["tex", "cls", "sty"],
        "text"        : ["txt"],
        "textile"     : ["textile"],
        "tt"          : ["tt", "tt2", "ttml"],
        "vb"          : ["bas", "cls", "frm", "ctl", "vb", "resx"],
        "vim"         : ["vim"],
        "yaml"        : ["yaml", "yml"],
        "xml"         : ["xml", "dtd", "xslt", "ent", "rdf", "rss", "svg", "wsdl", "atom", "mathml", "mml"]
    };
    var exts = [];
    for (var type in MAPPINGS) {
        exts = exts.concat(MAPPINGS[type]);
    }
    // grep pattern matching for extensions
    var PATTERN_EXT = makeUnique(exts).join(",");
    var dirs = [];
    for (type in IGNORE_DIRS) {
        dirs.push(type);
    }
    dirs = makeUnique(dirs);
    var PATTERN_DIR  = escapeRegExp(dirs.join("|"));
    var PATTERN_EDIR = dirs.join(",");
};
