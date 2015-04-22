var Q = require("q");
var _ = require("hr.utils");
var Model = require("hr.model");
var logger = require("hr.logger")("workspace");

var rpc = require("../core/rpc");

var Workspace = Model.extend({
    defaults: {
        id: "",
        title: ""
    },

    // Identify the workspace
    about: function() {
        var that = this;

        return rpc.execute("codebox/about")
        .then(function(data) {
            return that.set(data);
        })
        .thenResolve(that);
    },
});

module.exports = Workspace;
