var Q = require('q');
var _ = require('lodash');

var logger = require("./utils/logger")("hooks");

var HOOKS = {};

// Call hook
var use = function(hook, data) {
    logger.log("call hook ", hook);
};

// Init hook system
var init = function() {
    logger.log("init hooks");
};

module.exports = {
    init: init,
    use: use
};

