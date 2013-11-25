define([
    "underscore",
    "hr/hr",
    "vendors/socket.io-stream",
], function(_, hr, ss) {
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
            this.stream = ss.createStream();
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
            var ready = _.once(function() {
                that.trigger("ready");
            });

            this.codebox.socket("stream/shells", true).done(function(s) {
                that.socket = s;
                that.socket.on("disconnect", function() {
                    that.trigger("disconnect");
                }),
                that.socket.on("connect", function() {
                    // Send stream to server
                    ss(that.socket).emit('shell.open', that.stream, {
                        "shellId": that.shellId,
                        "opts": {
                            "rows": 80,
                            "columns": 24,
                            "id": that.shellId
                        }
                    });

                    that.stream.on("data", function(data) {
                        var out = data.toString("utf8")
                        that.trigger("data", out, data);
                        if (out.indexOf("]0;") >= 0) {
                            ready();
                        }
                    });

                    that.stream.on('error', function() {
                        that.trigger("error:stream");
                    });

                    that.stream.on('end', function() {
                        that.trigger("stream:end");
                    });

                    that.trigger("connect");
                });
            });

            return this;
        },

        /*
         *  Disconnect
         */
        disconnect: function() {
            if (this.socket != null) {
                this.socket.emit("shell.destroy", {
                    "shellId": this.shellId
                });
                this.socket.disconnect();
            }
            return this;
        },

        /*
         *  Write content
         */
        write: function(buf) {
            this.stream.write(buf);
            return this;
        },

        /*
         *  Run command
         */
        run: function(command, options) {
            options = _.defaults(options || {}, {
                timeout: null,
                callback: function(data) {}
            });

            var that = this;
            var d = new hr.Deferred();
            var output = "";
            var endOutput = "]0;"


            // Create and handler for the data
            var stopCommand = function(buf) {
                // Remove handler
                that.off("data", dataHandler);
                
            };
            var dataHandler = function(data) {
                var i = data.indexOf(endOutput);
                var buf = i < 0 ? data : data.slice(0, i);

                output = output + buf;
                options.callback(buf);

                if (i >= 0) {
                    stopCommand();
                    d.resolve(output);
                }
            };

            // Add handler
            this.on("data", dataHandler);

            // Add timeout
            if (options.timeout > 0) {
                setTimeout(function() {
                    stopCommand();
                    d.reject(output);
                }, options.timeout);
            }

            // Write the command
            this.write(command+"\n");

            return d;
        },
    });

    return Shell;
});