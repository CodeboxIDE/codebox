define([], function() {
    var hr = codebox.require("hr/hr");
    var Q = codebox.require("hr/promise");
    var box = codebox.require("core/box");
    var rpc = codebox.require("core/backends/rpc");
    
    var Debugger = hr.Class.extend({
        initialize: function(options) {
            Debugger.__super__.initialize.apply(this, arguments);

            this.id = null;
            this._breakpoints = [];

            // Bind debug event
            this.listenTo(box, "box:debug", function() {
                console.log("debugger event !!!!", arguments);
                //this.trigger("update");
            });
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

            return this.execute("close")
            .then(function() {
                that.stopListening();
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
            return this.execute("backtrace");
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

    return Debugger;
});