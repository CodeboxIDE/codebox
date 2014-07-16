define([
    "hr/hr",
    "hr/utils",
    "hr/promise",
    "models/command"
], function(hr, _, Q, Command) {
    var Commands = hr.Collection.extend({
        model: Command,

        // Register a new command
        register: function(cmd) {
            var c = this.get(cmd.id);
            if (c) this.remove(c);

            this.add(cmd);
        },

        // Run a command
        run: function(cmd) {
            var parts;

            parts = cmd.split(" ");

            cmd = this.get(parts[0]);
            if (!cmd) return Q.reject(new Error("Command not found: '"+parts[0]+"'"));

            return cmd.run(parts.slice(1).join(" "));
        }
    });

    return Commands;
});