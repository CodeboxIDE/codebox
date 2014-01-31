var Q = require('q');
var _ = require('lodash');
var path = require('path');


function CodeCompleteRPCService(codecomplete) {
    this.codecomplete = codecomplete;

    _.bindAll(this);
}

CodeCompleteRPCService.prototype.get = function(args, meta) {
    return this.codecomplete.get(args);
};

// Exports
exports.CodeCompleteRPCService = CodeCompleteRPCService;
