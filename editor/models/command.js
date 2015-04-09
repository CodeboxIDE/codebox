var Q = require("q");
var _ = require("hr.utils");
var Model = require("hr.model");
var logger = require("hr.logger")("command");

var keyboard = require("../utils/keyboard");

var ARGS = {
    'number': parseInt
};

var Command = Model.extend({
    defaults: {
        // Unique id for the command
        id: null,

        // Title for the command
        title: null,

        // Run command
        run: function(context) {},

        // Context needed for the command
        context: [],

        // Arguments
        arguments: [],

        // Keyboard shortcuts
        shortcuts: []
    },

    // Constructor
    initialize: function() {
        Command.__super__.initialize.apply(this, arguments);

        this.justRun = function(e) {
            if (e) e.preventDefault();
            this.run({}, e);
        }.bind(this);

        this.listenTo(this, "change:shortcuts", this.bindKeyboard);
        this.listenTo(this, "destroy", this.unbindKeyboard);
        this.bindKeyboard();
    },

    // Unbind keyboard shortcuts
    unbindKeyboard: function() {
        if (!this._shortcuts) return;

        keyboard.unbind(this._shortcuts, this, this.justRun);
    },

    // Bind keyboard shortcuts
    bindKeyboard: function() {
        this.unbindKeyboard();
        this._shortcuts = _.clone(this.get("shortcuts", []));
        keyboard.bind(this._shortcuts, this.justRun, this);
    },

    // Run a command
    run: function(args, origin) {
        var that = this;

        // Check context
        if (!this.isValidContext()) return Q();

        logger.log("Run", this.get("id"));

        return Q()
        .then(function() {
            return that.get("run").apply(that, [ args || {}, that.collection.context.data, origin ]);
        })
        .fail(function(err) {
            logger.error("Command failed", err);
        });
    },

    // Shortcut text
    shortcutText: function() {
        return keyboard.toText(this.get("shortcuts"));
    },

    // Valid context
    isValidContext: function() {
        var context = this.get("context") || [];
        return (context.length == 0
        || !this.collection
        || !this.collection.context
        || _.contains(context, this.collection.context.type));
    }
});

module.exports = Command;
