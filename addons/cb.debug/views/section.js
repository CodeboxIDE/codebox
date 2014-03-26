define([], function() {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var hr = codebox.require("hr/hr");

    var files = codebox.require("core/files");

    var DebugSection = hr.View.extend({
        className: "debug-section",
        defaults: {
            dbg: null
        },
        events: {},
        formats: [],

        initialize: function(options) {
            DebugSection.__super__.initialize.apply(this, arguments);
            
            // Debugger client
            this.dbg = this.options.dbg;

            this.$title = $("<h4>", {
                'text': this.title
            });

            this.$container = $("<div>", {
                'class': "table-container"
            });

            this.$table = $("<table>", {
                'class': "table"
            });

            this.$title.appendTo(this.$el);
            this.$container.appendTo(this.$el);
            this.$table.appendTo(this.$container);

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
                var $e;
                var value = item[key.id];

                if (key.type == "file") {
                    $e = $("<a>", {
                        'href': "#",
                        'text': value,
                        'click': function(e) {
                            e.preventDefault();
                            files.open(value, {
                                line: item.line
                            });
                        }
                    })
                } else {
                    $e = $("<span>", {
                        'text': value
                    });
                }

                $e.appendTo($("<td>").appendTo($line));
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
