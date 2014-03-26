define([
    "hr/hr",
    "hr/promise",
    "core/backends/rpc"
], function(hr, Q, rpc) {
    
    var DebuggerSession = hr.Class.extend({
        initialize: function(options) {
            DebuggerSession.__super__.initialize.apply(this, arguments);

            // Session id for this debugger
            this.id = null;

            // Breakpoints
            this._breakpoints = [];

            // Position
            this.position = null;
        },

        // Initialize the debugger
        init: function(args) {
            var that = this;
            return rpc.execute("debug/init", args)
            .then(function(dbg) {
                that.id = dbg.id;
                that.trigger("update:init");
            });
        },

        // Close debugger
        close: function() {
            var that = this;
            if (!that.id) return Q.reject(new Error("Session not yet initialized"));

            return this.execute("close")
            .then(function() {
                that.id = null;
                that.trigger("close");
                that.stopListening();
                that.off();
            });
        },

        // Execute a RPC requests
        execute: function(method, args, options) {
            var that = this;
            options = _.defaults(options || {}, {
                error: true
            });

            return rpc.execute("debug/"+method, _.extend(args || {}, {
                'id': this.id
            }))
            .then(function(data) {
                return data;
            },
            function(err) {
                if (options.error) that.trigger("error", err);
                return Q.reject(err);
            });
        },

        // Get locals
        locals: function() {
            return this.execute("locals");
        },

        // Get breakpoints
        breakpoints: function() {
            var that = this;

            return this.execute("breakpoints")
            .then(function(list) {
                that._breakpoints = list;
                return list;
            });
        },

        // Get backtrace
        backtrace: function() {
            return this.execute("backtrace")
            .then(_.bind(function(trace) {
                this.position = _.last(trace);
                this.trigger("position", this.position);

                return trace;
            }, this));
        },

        // Get a breapoint id from its location
        getBreakpoint: function(location) {
            return _.find(this._breakpoints, function(point) {
                return point.filename == location.path && point.line == location.line;
            });
        },

        // Add a breakpoint
        breakpointAdd: function(args) {
            var that = this;
            return this.execute("breakpoint/add", args)
            .then(function(point) {
                that.trigger("update:breakpoints:add");
                return point;
            });
        },

        // Remove a breakpoint
        breakpointRemove: function(num) {
            var that = this;

            return this.execute("breakpoint/clear", {
                'num': num
            })
            .then(function(point) {
                that.trigger("update:breakpoints:clear");
                return point;
            });
        },

        // Start
        start: function(arg) {
            var that = this;
            return this.execute("start", {
                'arg': arg
            })
            .then(function(output) {
                that.trigger("log", output);
                that.trigger("update:start");
            });
        },

        // Stop
        stop: function() {
            var that = this;
            return this.execute("stop")
            .then(function(output) {
                that.trigger("log", output);
                that.trigger("update:stop");
            });
        },

        // Next
        next: function() {
            var that = this;
            return this.execute("next")
            .then(function(output) {
                that.trigger("log", output);
                that.trigger("update:next");
            });
        },

        // Continue
        cont: function() {
            var that = this;
            return this.execute("cont")
            .then(function(output) {
                that.trigger("log", output);
                that.trigger("update:cont");
            });
        },

        // Restart
        restart: function() {
            var that = this;
            return this.execute("restart")
            .then(function(output) {
                that.trigger("log", output);
                that.trigger("update:restart");
            });
        },

        // Eval code
        eval: function(code) {
            var that = this;

            var handle = function(type, data) {
                that.trigger("update:eval:"+type);
                return {
                    'type': type,
                    'content': data.message || data
                };
            };

            return this.execute("eval", {
                'code': code
            }, {
                'error': false
            })
            .then(
                _.partial(handle, "log"),
                _.partial(handle, "error")
            );
        },
    });

    return DebuggerSession;
});