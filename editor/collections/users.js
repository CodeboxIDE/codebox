var Q = require("q");
var _ = require("hr.utils");
var Collection = require("hr.collection");
var logger = require("hr.logger")("users");

var User = require("../models/user");
var rpc = require("../core/rpc");

var Users = Collection.extend({
    model: User,

    listAll: function() {
        return rpc.execute("users/list")
        .then(this.reset.bind(this));
    },
});

module.exports = Users;
