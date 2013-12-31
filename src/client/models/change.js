define([
    "underscore",
    "hr/hr",
    "models/command",
    "backends/"
], function(_, hr, Command, File, vfs) {
    var Change = hr.Model.extend({
        defaults: {
            // Path
            'path': null,

            // Types of modification
            'type': "modified",

            // Time for the modification
            'time': 0,

            // Offline mode
            'offline': false
        },

        // apply the change
        apply: function() {
            if (this.get("offline") == false && !hr.Offline.isConnected()) {
                return Q.reject(new Error("Can't apply this change when offline"));
            }
            if (this.get("type") == "remove") {

            } else {
                return Q.reject(new Error("Invalid change type"));
            }
        },

        // Return an associated command for this change
        command: function() {
            var that = this;
            var c = new Command({}, {
                'title': this.get("path"),
                'label': this.get("type"),
                'offline': this.get("offline"),
                'action': function() {
                    return that.apply().then(function() {
                        d.destroy();
                    });
                }
            });
            return c;
        }
    });

    return Change;
});