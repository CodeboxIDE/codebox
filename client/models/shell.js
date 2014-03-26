define([
    "hr/utils",
    "hr/hr",
    "utils/hash",
    "vendors/socket.io",
], function(_, hr, hash) {
    var logging = hr.Logger.addNamespace("terminal");

    var Shell = hr.Model.extend({
        defaults: {
            
        },

        /*
         *  Initialize a terminal from a codebox
         */
        initialize: function() {
            Shell.__super__.initialize.apply(this, arguments);

            this.codebox = this.options.codebox;
            this.shellId = this.options.shellId || _.uniqueId("term");
            
            return this;
        },

        /*
         *  Connect to the terminal
         */
        connect: function() {
            var that = this;
            if (this.socket != null) {
                return this;
            }

            this.codebox.socket("shells", true).done(function(s) {
                that.socket = s;

                that.socket.on("disconnect", function() {
                    that.trigger("disconnect");
                });

                that.socket.on("connect", function() {
                    that.trigger("connect");
                });

                that.socket.emit('shell.open', {
                    "shellId": that.shellId,
                    "opts": {
                        "rows": 80,
                        "columns": 24,
                        "id": that.shellId,
                        "cwd": that.options.cwd
                    }
                });

                that.socket.on("shell.output", function(data) {
                    that.trigger("data", hash.atob(data));
                });
            });

            return this;
        },

        /*
         *  Disconnect
         */
        disconnect: function() {
            if (this.socket != null) {
                this.socket.disconnect();
            }
            return this;
        },

        /*
         *  Write content
         */
        write: function(buf) {
            if (this.socket != null) {
                this.socket.emit("shell.input", hash.btoa(buf));
            }
            return this;
        },

        /*
         *  Resize the shell
         */
        resize: function(w, h) {
            if (this.socket != null) {
                this.socket.emit("shell.resize", {
                    "rows": h,
                    "columns": w
                });
            }
            return this;
        },

        /*
         *  Force destroy the shell
         */
        forceDestroy: function() {
            if (this.socket != null) {
                this.socket.emit("shell.destroy");
            }
            return this;
        }
    });

    return Shell;
});