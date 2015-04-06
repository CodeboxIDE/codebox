var Q = require("q");
var _ = require("hr.utils");
var Collection = require("hr.collection");
var logger = require("hr.logger")("commands");

var Command = require("../models/command");

var Commands = hr.Collection.extend({
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
    run: function(cmd, args) {

        cmd = this.get(cmd);
        if (!cmd) return Q.reject(new Error("Command not found: '"+cmd+"'"));

        return cmd.run(args);
    },

    // Set context
    setContext: function(id, data) {
        logging.log("update context", id);
        this.context = {
            'type': id,
            'data': data
        };
        this.trigger("context", this.context);
    }
});

module.exports = Commands;
