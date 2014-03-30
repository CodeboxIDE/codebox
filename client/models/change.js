define([
    "hr/utils",
    "hr/hr",
    "models/command",
    "core/operations"
], function(_, hr, Command, operations) {
    var logger = hr.Logger.addNamespace("changes");

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

        // Apply the change
        apply: function() {
            var that = this;
            var vfs = require("core/backends/vfs");

            if (this.get("offline") == false && !hr.Offline.isConnected()) {
                return Q.reject(new Error("Can't apply this change when offline"));
            }

            operations.start("change.apply", function(op) {
                var url = ("/vfs/"+that.get("path")).replace("//", "/");
                var ctype = that.get("type");

                logger.log("apply change", ctype, that.get("path"));

                return Q().then(function() {
                    if (ctype == "remove") {
                        return vfs.execute("remove", {}, {
                            'url': url
                        });
                    } else if (ctype == "mkdir") {
                        return vfs.execute("mkdir", {}, {
                            'url': url+"/"
                        });
                    } else if (ctype == "create") {
                        return vfs.execute("create", {}, {
                            'url': url
                        });
                    } else if (ctype == "write") {
                        return vfs.execute("write", that.get("content", ""), {
                            'url': url
                        });
                    }else {
                        return Q.reject(new Error("Invalid change type"));
                    }
                }).then(function() {
                    that.destroy();
                    return Q();
                }, function(err) {
                    logger.error(err);
                    return Q.reject(err);
                });
            })
        },

        // Return an associated command for this change
        command: function() {
            var that = this;
            var c = new Command({}, {
                'title': this.get("path"),
                'label': this.get("type"),
                'offline': this.get("offline"),
                'action': function() {
                    return that.apply();
                }
            });
            return c;
        }
    });

    return Change;
});