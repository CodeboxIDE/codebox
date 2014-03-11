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
                console.log("init !!", dbg);
                that.id = dbg.id;
            });
        },

        // Execute a RPC requests
        execute: function(method, args) {
            return rpc.execute("debug/"+method, _.extend(args || {}, {
                'id': this.id
            }));
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
                that.trigger("update");
                return point;
            });
        },

        // Remove a breakpoint
        breakpointRemove: function(num) {
            var that = this;

            return this.execute("breakpoint/clear", {
                'id': num
            })
            .then(function(point) {
                that.trigger("update");
                return point;
            });
        },
    });

    return Debugger;
});