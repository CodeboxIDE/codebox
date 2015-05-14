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
        shortcuts: [],

        // Hidden from command palette
        hidden: false,

        // Disabled (not runnable)
        enabled: true
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
        if (!this.isRunnable()) return Q();

        logger.log("Run", this.get("id"));

        return Q()
        .then(function() {
            return that.get("run").apply(that, [ args || {}, that.collection.context, origin ]);
        })
        .fail(function(err) {
            logger.exception("Command failed", err);
        });
    },

    // Shortcut text
    shortcutText: function() {
        return keyboard.toText(this.get("shortcuts"));
    },

    // Valid context
    hasValidContext: function() {
        var context = this.get("context") || [];
        var currentContext = _.keys(this.collection.context);

        return _.difference(context, currentContext).length == 0;
    },

    // Valid a command name against this command and return a match score
    resolve: function(cmd) {
        var score = 0;
        var parts = cmd.split(".");
        var thisParts = this.get("id").split(".");

        _.each(parts, function(part, i) {
            if (!thisParts[i]) return false;

            var r = new RegExp(thisParts[i]);
            if (part.match(r) == null) {
                return false;
            }

            score = score + 1;
        });

        if (score < thisParts.length) return 0;
        return (score/parts.length) + (score/thisParts.length);
    },

    // Check if command is runnable
    isRunnable: function() {
        return this.hasValidContext() && this.get("enabled");
    }
});

module.exports = Command;
