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
                title: "File",
                type: "file"
            },
            {
                id: "line",
                title: "Line"
            }
        ],

        update: function() {
            var that = this;
            
            return this.dbg.breakpoints()
            .then(function(breakpoints) {
                that.clearLines();
                _.each(breakpoints, that.addLine, that);
            });
        }
    });

    return BreakpointsSection;
});
