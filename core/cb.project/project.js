var Q = require('q');
var _ = require('underscore');
var path = require('path');
var utils = require('../utils');

function ProjectType(workspace, events, logger) {
    this.workspace = workspace;
    this.events = events;
    this.logger = logger;
    
    this.clear();

    _.bindAll(this);

     this.logger.log("project is ready");
};

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
    this.ignoreRules = [];

    // List of files with rules
    this.ignoreRulesFiles = [
        ".ignore",
        ".gitignore"
    ];
};

/*
 *  Merge a new project type
 */
ProjectType.prototype.merge = function(type) {
    type = _.defaults({}, type, {

        // Runner list
        runner: [],

        // Rules of glob to ignore
        ignoreRules: [],

        // List of files with rules
        ignoreRulesFiles: []
    });

    // First type merged define the project name
    if (!this.id) {
        this.id = type.id;
        this.name = type.name;
    }

    // Add Runner
    this.runner = _.chain(this.runner)
        .concat(
            _.map(type.runner, function(runner) {
                if (!runner.script || !runner.id) return null;
                var _id =type.id+":"+runner.id;
                return {
                    'id': _id,
                    'script': runner.script,
                    'name': runner.name || _id,
                    'score': runner.score || 1,
                    'type': runner.type || "run"
                };
            })
        )
        .compact()
        .sortBy(function(runner) {
            return -runner.score;
        })
        .value();

    // Ignore rules
    this.ignoreRules = this.ignoreRules.concat(type.ignoreRules);

    // Ignore rules file
    this.ignoreRulesFiles = this.ignoreRulesFiles.concat(type.ignoreRulesFiles);

    this.types.push(type.id);
};

/*
 *  Define a project
 */
ProjectType.prototype.define = function(types) {
    var typeIds;

    // Clear current infos
    this.clear();

    // Merge new infos
    _.each(types.reverse(), this.merge, this);

    // Signal
    typeIds = _.pluck(types, "id");
    this.logger.log("define", typeIds);
    this.events.emit('project.define', typeIds);
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
        'ignoreRules': this.ignoreRules,
        'ignoreRulesFiles': this.ignoreRulesFiles
    };
};

/*
 *  Return a list of all ignored directories
 */
ProjectType.prototype.getIgnoreRules = function() {
    // todo: read this.ignoreRulesFiles
    return Q(this.ignoreRules);
};

/*
 *  Return run script
 */
ProjectType.prototype.getRunner = function(options) {
    options = _.defaults({}, options, {
        // Filter runner by name
        'name': null,

        // Filter type
        'type': null,

        // Pick only one
        'pick': false
    });

    var c = _.chain(this.runner)
    .filter(function(runner) {
        if (options.name && options.name != runner.name) return false; 
        if (options.type && options.type != runner.type) return false;
        return true;
    }); 

    if (options.pick) c = c.first();

    return c.value();
};


// Exports
exports.ProjectType = ProjectType;
