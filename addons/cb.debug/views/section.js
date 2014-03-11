define([], function() {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var hr = codebox.require("hr/hr");

    var DebugSection = hr.View.extend({
        className: "debug-section",
        defaults: {
            title: ""
        },
        events: {},
        formats: [],

        initialize: function(options) {
            DebugSection.__super__.initialize.apply(this, arguments);
            this.$el.html("<h4>"+this.title+"</h4>");

            this.$table = $("<table>", {
                'class': "table"
            });
            this.$table.appendTo(this.$el);
            this.clearLines();

            return this;
        },

        // Render
        render: function() {
            return this.ready();
        },

        // Clear items
        clearLines: function() {
            this.$table.empty();

            // Initiliaze format
            var $line = $("<tr>");

            _.each(this.formats, function(key) {
                $("<th>", {
                    'text': key.title
                }).appendTo($line);
            });
            $line.appendTo(this.$table);
        },

        // Add an item
        addLine: function(item) {
            var $line = $("<tr>");

            _.each(this.formats, function(key) {
                $("<td>", {
                    'text': item[key.id]
                }).appendTo($line);
            });
            $line.appendTo(this.$table);
        },

        // Update content
        update: function() {
            // to defined
        }
    });

    return DebugSection;
});
