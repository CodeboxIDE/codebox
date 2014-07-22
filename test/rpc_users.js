var Q = require("q");
var _ = require("lodash");

var users = require("../lib/services/users");

describe('RPC users', function() {
    it("can list users", function(done) {
        qdone(
            Q(users.list({}))
            .then(function(users) {
                var tokens = _.compact(_.pluck(users, "token"));
                var ids = _.pluck(users, "id");

                assert(_.size(tokens) == 0);
                assert(_.contains(ids, "test"));
            })
        , done);
    });
});
