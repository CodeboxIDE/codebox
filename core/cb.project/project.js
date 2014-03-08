var Q = require('q');
var _ = require('lodash');

var os = require('os');
var path = require('path');
var Minimatch = require("minimatch").Minimatch

var utils = require('../utils');

function ProjectType(workspace, events, logger) {
    this.workspace = workspace;
    this.events = events;
    this.logger = logger;

    this.clear();

    _.bindAll(this);

     this.logger.log("project is ready");
}

/*
 *  Clear project informations
 */
ProjectType.prototype.clear = function() {
    // Unique project type id
    this.id = null;

    // Name associated to the project type
    this.name = null;

    // List of run and build scripts
    this.runner = [];

    // List of merged project types id
    this.types = [];

    // Rules of files to ignore
    this.ignoreRules = [
        ".git",
        ".DS_Store",
    ];

    this._ignoreRules = [];
};

/*
 *  Merge a new project type
 */
ProjectType.prototype.merge = function(type) {
    var that = this;

    type = _.defaults({}, type, {

        // Runner list
        runner: [],

        // Rules of glob to ignore
        ignoreRules: []
    });

    // First type merged define the project name
    if (!this.id) {
        this.id = type.id;
        this.name = type.name;
    }

    return Q().then(function() {
        return Q(_.result(type, 'runner'));
    }).then(function(_runner) {
        // Add runner
        that.runner = _.chain(that.runner)
        .concat(
            _.map(_runner, function(runner) {
                if (!runner.script || !runner.id) return null;
                var _id =type.id+":"+runner.id;
                return {
                    'id': _id,
                    'script': runner.script,
                    'name': runner.name || _id,
                    'type': runner.type || "run"
                };
            })
        )
        .compact()
        .value();
    }).then(function() {
        // Ignore rules
        that.ignoreRules = that.ignoreRules.concat(type.ignoreRules);

        // Map rules
        that._ignoreRules = _.map(that._ignoreRules, function(rule) {
            return new Minimatch(rule, {
                matchBase: true,
                dot: true,
                flipNegate: true
            });
        })

        that.types.push(type.id);
        that.types = that.types.concat(type.otherIds || [])
    });
};

/*
 *  Define a project
 */
ProjectType.prototype.define = function(types) {
    var typeIds, that = this;
    var oldTypes = _.clone(that.types);

    // Clear current infos
    this.clear();

    // Merge new infos
    return _.reduce(types, function(prev, type) {
        return prev.then(function() {
            return that.merge(type);
        });
    }, Q()).then(function() {
        typeIds = that.types;

        var diff = !(_.difference(oldTypes, typeIds).length == 0 && oldTypes.length == typeIds.length);
        if (diff) that.events.emit('project.define', typeIds);
    });
};

/*
 *  Return a representation for this project type
 */
ProjectType.prototype.reprData = function() {
    return {
        'id': this.id,
        'name': this.name,
        'types': this.types,
        'runner': this.runner,
        'ignoreRules': this.ignoreRules
    };
};

/*
 *  Return a list of all workspace files
 *  that are not ignored by git ...
 */
ProjectType.prototype.getBaseFiles = function() {
    return utils.exec(
        '((git ls-files ; git ls-files --others --exclude-standard) || find . -type f)',
        {
            cwd: this.workspace.root
        }
    )
    .get('stdout')
    .then(function(stdout) {
        return _.compact(stdout.split(os.EOL));
    });
};

/*
 *  Is a file currently ignored by our 'ignoreRules'
 */
ProjectType.prototype.isIgnored = function(file) {
    if (file[0] != "/") file = "/"+file;

    return _.any(_.map(this._ignoreRules, function(rule) {
        return rule.match(file);
    }));
};

ProjectType.prototype.filterFiles = function(files) {
    var that = this;

    return _.filter(files, function(file) {
        return !that.isIgnored(file);
    });
};

/*
 *
 *
 */
ProjectType.prototype.getValidFiles = function() {
    return this.getBaseFiles()
    .then(this.filterFiles);
};

/*
 *  Return run script
 */
ProjectType.prototype.getRunner = function(options) {
    options = _.defaults({}, options, {
        // Filter runner by id
        'id': null,

        // Filter type
        'type': null,

        // Pick only one
        'pick': false
    });

    var c = _.chain(this.runner)
    .filter(function(runner) {
        if (options.id && options.id != runner.id) return false;
        if (options.type && options.type != runner.type) return false;
        return true;
    });

    if (options.pick) c = c.first();

    return c.value();
};


// Exports
exports.ProjectType = ProjectType;
