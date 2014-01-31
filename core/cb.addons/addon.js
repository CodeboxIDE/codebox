var _ = require('lodash');
var fs  =  require('fs');
var path = require('path');
var wrench = require('wrench');
var child_process = require('child_process');
var Q = require("q");

var exec = function(command, options) {

    var deferred = Q.defer();
    var childProcess;

    var args = Array.prototype.slice.call(arguments, 0);
    args.push(function(err, stdout, stderr) {
        if (err) {
            err.message += command + ' (exited with error code ' + err.code + ')';
            err.stdout = stdout;
            err.stderr = stderr;
            deferred.reject(err);
        }
        else {
            deferred.resolve({
                childProcess: childProcess,
                stdout: stdout,
                stderr: stderr
            });
        }
    });

    childProcess = child_process.exec.apply(child_process, args);

    return deferred.promise;
}

var Addon = function(logger, _rootPath, options) {
    this.root = _rootPath;
    this.infos = {};
    this.options = options;

    // Load addon infos from an addon's directory
    this.load = Q.fbind(function(addonDir) {
        addonDir = addonDir || this.root;

        // Check addon
        var packageJsonFile = path.join(addonDir, "package.json");
        if (!fs.existsSync(packageJsonFile)) {
            throw new Error("No 'package.json' in this repository: "+addonDir);
        }
        this.infos = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));
        if (!this.isValid()) {
            throw new Error("Invalid 'package.json' file: "+packageJsonFile);
        }

        return this;
    });

    // Valid the addon
    this.isValid = function() {
        return !(!this.infos.name || !this.infos.version
            || (!this.infos.main && !this.infos.client && !this.infos.client.main));
    };

    // Test is symlink
    this.isSymlink = function() {
        return Q.nfcall(fs.lstat, this.root).then(function(stats) {
            return stats.isSymbolicLink();
        });
    };

    // Check if an addon is client side
    this.isClientside = function() {
        return (this.infos.client && this.infos.client.main);
    };

    // Check if an addon is node addon
    this.isNode = function() {
        return (this.infos.main);
    };

    // Check if an addon is already optimized
    this.isOptmized = function() {
        return fs.existsSync(path.join(this.root, "addon-built.js"));
    };

    // Check if an addon has node dependencies
    this.hasDependencies = function() {
        return _.size(this.infos.dependencies || {}) > 0;
    };

    // Check if an addon has npm scripts
    this.hasScripts = function() {
        return _.size(this.infos.scripts || {}) > 0;
    };

    // Check if the addon is blacklisted
    this.isBlacklisted = function() {
        return _.contains(this.options.blacklist, this.infos.name);
    };

    // Optimize the addon
    this.optimizeClient = function(force) {
        var that = this;
        var d = Q.defer();

        if (!this.isClientside()
        || (this.isOptmized() && !force)) {
            return Q(this);
        }

        // R.js bin
        var rjs = path.resolve(__dirname, "../../node_modules/.bin/r.js");

        // Base directory for the addon
        var addonPath = this.root;

        // Path to the require-tools
        var requiretoolsPath = path.resolve(__dirname, "../../client/build/static/require-tools");

        // Base main
        var main = this.infos.client.main;

        // Output file
        var output = path.resolve(addonPath, "addon-built.js");

        // Build config (todo: use this config for the command)
        var optconfig = {
            'baseUrl': addonPath,
            'name': main,
            'out': output,
            'paths': {
                'require-tools': requiretoolsPath
            },
            'optimize': "none",
            'map': {
                '*': {
                    'css': "require-tools/css/css",
                    'less': "require-tools/less/less",
                    'text': "require-tools/text/text"
                }
            }
        };

        var command = rjs+" -o baseUrl="+addonPath+" paths.require-tools="+requiretoolsPath+" name="+main+" map.*.css=require-tools/css/css map.*.less=require-tools/less/less map.*.text=require-tools/text/text out="+output;

        // Run optimization
        logger.log("Optimizing", this.infos.name);
        return Q.nfcall(fs.unlink, output).fail(function() {
            return Q();
        }).then(function() {
            return exec(command)
        }).then(function() {
            logger.log("Finished", that.infos.name, "optimization");
            return Q(that);
        }, function(err) {
            logger.error("error for optimization of", that.infos.name);
            logger.error("command=",command);
            logger.error(err.stdout);
            logger.exception(err, false);
            return Q.reject(err);
        });
    };

    // Install dependencies for this addon
    this.installDependencies = function(force) {
        var that = this;
        if (!force) {
            if (!this.hasDependencies() && !this.hasScripts()) {
                return Q(this);
            }
        }
        logger.log("Install dependencies for", this.root);
        return exec("cd "+this.root+" && npm install .").then(function() {
            return Q(that);
        });
    };

    // Transfer to a new root directory
    this.transfer = function(newRoot, options) {
        var that = this;
        options = _.defaults({}, options || {}, {
            forceDelete: true,
            excludeHiddenUnix: false,
            preserveFiles: false
        });

        var addonPath = path.join(newRoot, this.infos.name);
        return Q.nfcall(wrench.copyDirRecursive, this.root, addonPath, options).then(function() {
            var addon = new Addon(logger, addonPath, that.options);
            return addon.load();
        });
    };

    // Symlink this addons
    this.symlink = function(newRoot) {
        var that = this;
        var addonPath = path.join(newRoot, this.infos.name);
        return Q.nfcall(fs.symlink, this.root, addonPath, 'dir').then(function() {
            var addon = new Addon(logger, addonPath, that.options);
            return addon.load();
        });
    };

    // Unlink this addon
    this.unlink = function() {
        return Q.nfcall(fs.unlink, this.root);
    };

    // Start the node process
    this.start = function(app) {
        var that = this;
        if (!this.isNode()) {
            return Q(this);
        }

        logger.log("start addon", this.root);
        return app.load([
            {
                'packagePath': this.root
            }
        ]).then(function() {
            return Q(that);
        });
    };

    // Return addons cache resources list
    this.resources = function() {
        return ["addon-built.js"].concat(this.infos.client ? (this.infos.client.resources || []) : []);
    };

    // Return addons network resources list
    this.network = function() {
        return [].concat(this.infos.client ? (this.infos.client.network || []) : []);
    };
};

module.exports = Addon;