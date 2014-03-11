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
                id: "filename",
                title: "File"
            },
            {
                id: "line",
                title: "Line"
            }
        ],

        update: function() {
            this.clearLines();
        }
    });

    return BreakpointsSection;
});
