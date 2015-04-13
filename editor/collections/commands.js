var Q = require("q");
var _ = require("hr.utils");
var Collection = require("hr.collection");
var logger = require("hr.logger")("commands");

var Command = require("../models/command");

var Commands = Collection.extend({
    model: Command,

    // Initialize
    initialize: function() {
        Commands.__super__.initialize.apply(this, arguments);

        this.context = {};
    },

    // Register a new command
    register: function(cmd) {
        if (_.isArray(cmd)) return _.map(cmd, this.register, this);

        var c = this.get(cmd.id);
        if (c) this.remove(c);

        return this.add(cmd);
    },

    // Run a command
    run: function(_cmd, args) {
        var cmd = this.resolve(_cmd);
        if (!cmd) return Q.reject(new Error("Command not found: '"+_cmd+"'"));

        return cmd.run(args);
    },

    // Resolve a command
    resolve: function(_cmd) {
        return _.chain(this.models)
            .map(function(m) {
                return {
                    cmd: m,
                    score: m.resolve(_cmd)
                };
            })
            .filter(function(r) {
                return r.score > 0;
            })
            .sortBy("score")
            .pluck("cmd")
            .last()
            .value();
    },

    // Set context
    setContext: function(ctx) {
        logger.log("update context", _.keys(ctx));
        this.context = ctx || {};
        this.trigger("context", this.context);
    }
});

module.exports = Commands;
