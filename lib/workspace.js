var util = require('util');
var Q = require('q');
var _ = require('lodash');

var logger = require('./utils/logger')("workspace");

var root = null;

// Init the workspace
var init = function(config) {
    root = config.root;

    logger.log("Working on ", root);
};

module.exports = {
    init: init
};
