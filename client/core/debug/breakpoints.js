define([
    "hr/hr",
    "hr/utils"
], function(hr, _) {
    
    var Breakpoints = hr.Class.extend({
        initialize: function() {
            Breakpoints.__super__.initialize.apply(this, arguments);

            // map filename -> array of int
            this.breakpoints = {};
        },

        // Signal change for a breakpoint
        signalChange: function(change, path, line) {
            this.trigger("change:"+change, {
                'change': change,
                'path': path,
                'line': line
            });
        },

        // Return all breakpoints
        all: function() {
            return _.clone(this.breakpoints);
        },

        // Get breakpoints for a file
        getFileBreakpoints: function(path) {
            return this.breakpoints[path] || [];
        },

        // When breakpoints changed for a file
        setFileBreakpoints: function(path, breakpoints) {
            var oldBreakpoints = this.breakpoints[path] || [];
            this.breakpoints[path] = _.clone(breakpoints);
            
            var added = _.difference(this.breakpoints[path], oldBreakpoints);
            var removed = _.difference(oldBreakpoints, this.breakpoints[path]);

            _.each(added, _.partial(_.bind(this.signalChange, this), "add", path));
            _.each(removed, _.partial(_.bind(this.signalChange, this), "remove", path));
        }
    });

    return Breakpoints;
});