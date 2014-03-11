define([
    "views/section"
], function(DebugSection) {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var hr = codebox.require("hr/hr");
    var rpc = codebox.require("core/backends/rpc");

    var BreakpointsSection = DebugSection.extend({
        title: "Breakpoints",
        formats: [
            {
                id: "num",
                title: "#"
            },
            {
                id: "filename",
                title: "File"
            },
            {
                id: "line",
                title: "Line"
            }
        ],

        initialize: function(options) {
            BreakpointsSection.__super__.initialize.apply(this, arguments);
            
            this.list = [];

            return this;
        },

        update: function() {
            var that = this;
            rpc.execute("debug/breakpoints")
            .then(function(breakpoints) {
                that.list = breakpoints;
                that.clearLines();
                _.each(breakpoints, that.addLine, that);
            });
        }
    });

    return BreakpointsSection;
});
