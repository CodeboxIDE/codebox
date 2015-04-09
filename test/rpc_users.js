var Q = require("q");
var _ = require("lodash");

var rpc = require("../lib/rpc");

describe('RPC users', function() {
    it("can list users", function() {
        return Q(rpc.get("users").list({}))
        .then(function(users) {
            var tokens = _.compact(_.pluck(users, "token"));
            var ids = _.pluck(users, "id");

            expect(tokens) .to.have.length(0);
            expect(_.contains(ids, "test"));
        });
    });
});
