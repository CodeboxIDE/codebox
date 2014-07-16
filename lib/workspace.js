var path = require('path');
var Q = require('q');
var _ = require('lodash');

var logger = require('./utils/logger')("workspace");

var root = null;

// Init the workspace
var init = function(config) {
    root = path.resolve(config.root);

    logger.log("Working on ", root);
};

// Return a correct path for the workspace
var getPath = function(_path) {
    _path = path.resolve(root, _path);

    if (path.relative(root, _path).substr(0, 3) === "../") {
        var err = new Error("EACCESS: '" + _path + "' not in '" + root + "'");
        err.code = "EACCESS";

        return Q.reject(err);
    }

    return Q(_path);
};


module.exports = {
    init: init,
    path: getPath
};