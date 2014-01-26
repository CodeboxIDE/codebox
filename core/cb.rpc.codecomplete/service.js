var Q = require('q');
var _ = require('underscore');
var path = require('path');


function CodeCompleteRPCService(workspace, codecomplete) {
    this.workspace = workspace;

    this.codecomplete = codecomplete;

    _.bindAll(this);
}

CodeCompleteRPCService.prototype.file = function(args, meta) {
    if(!args.file) {
        throw new Error('Missing "file" argument');
    }

    return Q({
        
    });
};

// Exports
exports.CodeCompleteRPCService = CodeCompleteRPCService;
