var Q = require("q");
var _ = require("lodash");

var rpc = require("../lib/rpc");

describe('RPC users', function() {
    it("can list users", function(done) {
        qdone(
            Q(rpc.get("users").list({}))
            .then(function(users) {
                var tokens = _.compact(_.pluck(users, "token"));
                var ids = _.pluck(users, "id");

                assert(_.size(tokens) == 0);
                assert(_.contains(ids, "test"));
            })
        , done);
    });
});
