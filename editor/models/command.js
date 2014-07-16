define([
    "hr/hr",
    "hr/utils",
    "utils/keyboard"
], function(hr, _, keyboard) {
    var logging = hr.Logger.addNamespace("command");
    var ARGS = {
        'number': parseInt
    };

    var Command = hr.Model.extend({
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

            this.justRun = _.compose(this.run, _.constant(""));

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
            this._shortcuts = this.get("shortcuts", []);
            keyboard.bind(this._shortcuts, this.justRun, this);
        },

        // Run a command
        run: function(cmd) {
            logging.log("Run", this.get("id"));

            var parts, args, cargs, that = this;
            cmd = cmd || "";
            parts = cmd.split(" ");

            args = this.get("arguments");
            parts = _.map(parts, function(part, i) {
                if (args.length <= i) return part;

                return ARGS[args[i]](part);
            });

            cargs = parts.slice(0, args.length);
            cargs.push(parts.slice(args.length).join(" "));

            return Q()
            .then(function() {
                return that.get("run").apply(that, cargs);
            });
        }
    });

    return Command;
});