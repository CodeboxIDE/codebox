var Q = require('q');
var _ = require('underscore');

var os = require('os');
var path = require('path');
var utils = require('../utils');

function DeploymentSolution(workspace, events, logger, infos) {
    this.workspace = workspace;
    this.events = events;
    this.logger = logger;

    this.infos = infos;

    _.bindAll(this);
};


DeploymentSolution.prototype.reprData = function() {
    return {
        'id': this.infos.id,
        'name': this.infos.name,
        'settings': this.infos.settings || {},
        'actions': _.map(this.infos.actions || [], function(action) {
            return {
                'id': action.id,
                'name': action.name
            };
        })
    }
};

// Exports
exports.DeploymentSolution = DeploymentSolution;
