var _ = require('underscore');
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
    setImmediate(function() {
        deferred.notify(childProcess);
    });

    return deferred.promise;
}

var Addon = function(logger, _rootPath) {
    this.root = _rootPath;
    this.infos = {};

    // Load addon infos from an addon's directory
    this.load = Q.fbind(function(addonDir) {
        addonDir = addonDir || this.root;

        // Check addon
        var packageJsonFile = path.join(addonDir, "package.json");
        if (!fs.existsSync(packageJsonFile)) {
            throw new Error("No 'package.json' in this repository");
        }
        this.infos = JSON.parse(fs.readFileSync(packageJsonFile, 'utf8'));
        if (!this.isValid()) {
            throw new Error("Invalid 'package.json' file");
        }

        return this;
    });

    // Valid the addon
    this.isValid = function() {
        return !(!this.infos.name || !this.infos.version
            || (!this.infos.main && !this.infos.client && !this.infos.client.main));
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

        // Build config
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
                    'less': "require-tools/less/less"
                }
            }
        };

        var command = rjs+" -o baseUrl="+addonPath+" paths.require-tools="+requiretoolsPath+" name="+main+" map.*.css=require-tools/css/css map.*.less=require-tools/less/less out="+output;

        // Run optimization
        logger.log("Optimizing", this.infos.name);
        return exec(command).then(function() {
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
            if (!this.hasDependencies()) {
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
        options = _.defaults({}, options || {}, {
            forceDelete: true,
            excludeHiddenUnix: false,
            preserveFiles: false
        });

        var addonPath = path.join(newRoot, this.infos.name);
        return Q.nfcall(wrench.copyDirRecursive, this.root, addonPath, options).then(function() {
            var addon = new Addon(logger, addonPath);
            return addon.load();
        });
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
};

module.exports = Addon;