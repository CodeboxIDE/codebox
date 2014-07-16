define([
    "hr/hr"
], function(hr) {
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
            arguments: []
        },

        // Run a command
        run: function(cmd) {
            var parts, args, cargs, that;

            parts = this.split(" ");

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