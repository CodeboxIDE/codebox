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

        update: function() {
            var that = this;
            rpc.execute("debug/breakpoints")
            .then(function(stack) {
                that.clearLines();
                _.each(stack, that.addLine, that);
            });
        }
    });

    return BreakpointsSection;
});
