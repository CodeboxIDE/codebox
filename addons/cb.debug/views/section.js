define([], function() {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var hr = codebox.require("hr/hr");

    var DebugSection = hr.View.extend({
        className: "debug-section",
        defaults: {
            title: ""
        },
        events: {
            
        },

        initialize: function(options) {
            DebugSection.__super__.initialize.apply(this, arguments);
            this.$el.html("<h4>"+this.options.title+"</h4>")

            return this;
        },

        // Render
        render: function() {

            return this.ready();
        }
    });

    return DebugSection;
});
