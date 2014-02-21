// Requires
var Q = require('q');
var _ = require('lodash');


function UsersRPCService(workspace) {
    this.workspace = workspace;

    _.bindAll(this);
}

UsersRPCService.prototype.list = function() {
    return this.workspace.users()
    .then(function(users) {
        return users.map(function(user) {
            return user.publicInfo();
        });
    });
};

// Exports
exports.UsersRPCService = UsersRPCService;
