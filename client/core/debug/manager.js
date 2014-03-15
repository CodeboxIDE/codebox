define([
    "hr/hr",
    "hr/promise",
    "core/debug/session",
    "core/debug/breakpoints"
], function(hr, Q, DebuggerSession, DebuggerBreakpoints) {
    
    var Debugger = hr.Class.extend({
        initialize: function(options) {
            Debugger.__super__.initialize.apply(this, arguments);

            // Active debugger
            this.activeDebugger = null;

            // Debugegr running
            this.state = false;

            // Current breakpoints
            this.breakpoints = new DebuggerBreakpoints();
        },

        // Open a debugger session
        open: function() {
            if (this.isActive()) {
                // already an active debugger -> close it
                return this.activeDebugger.close()
                .then(_.bind(function() {
                    return this.open();
                }, this));
            }

            this.activeDebugger = new DebuggerSession();
            this.trigger("state", true);

            this.listenTo(this.activeDebugger, "close", function() {
                this.activeDebugger = null;
                this.trigger("state", false);
            });

            return Q(this.activeDebugger);
        },

        // Return if debug is active
        isActive: function(st) {
            return this.activeDebugger != null;
        }
    });

    return new Debugger();
});