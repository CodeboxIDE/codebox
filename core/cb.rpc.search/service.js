// Requires
var Q = require('q');
var _ = require('lodash');

function SearchRPCService(search) {
    this.search = search;

    _.bindAll(this);
}

SearchRPCService.prototype.files = function(args) {
    _.defaults(args, {
        path: '/'
    });
    return this.search.files(args);
};

SearchRPCService.prototype.code = function(args) {
    _.defaults(args, {});
    return this.search.code(args);
};

// Exports
exports.SearchRPCService = SearchRPCService;
