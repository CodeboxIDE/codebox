define([], function() {
    var hr = codebox.require("hr/hr");
    var _ = codebox.require("hr/utils");
    var box = codebox.require("core/box");
    
    var Breakpoints = hr.Class.extend({
        initialize: function() {
            Breakpoints.__super__.initialize.apply(this, arguments);

            // map filename -> array of int
            this.breakpoints = {};

            this.listenTo(box, "debug:breakpoints", this.onBreakpointsChange)
        },

        // Return all breakpoints
        all: function() {
            return _.clone(this.breakpoints);
        },

        // Signal change for a breakpoint
        signalChange: function(change, path, line) {
            this.trigger("change:"+change, {
                'change': change,
                'path': path,
                'line': line
            });
        },

        // When breakpoints changed for a file
        onBreakpointsChange: function(e) {
            var oldBreakpoints = this.breakpoints[e.path] || [];
            this.breakpoints[e.path] = _.clone(e.breakpoints);
            
            var added = _.difference(this.breakpoints[e.path], oldBreakpoints);
            var removed = _.difference(this.breakpoints[e.path], oldBreakpoints);

            _.each(added, _.partial(_.bind(this.signalChange, this), "add", e.path));
            _.each(removed, _.partial(_.bind(this.signalChange, this), "remove", e.path));
        }
    });

    return new Breakpoints();
});