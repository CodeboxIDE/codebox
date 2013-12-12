define([
    "hr/hr"
], function(hr) {

    // List Item View
    var CommandItem = hr.List.Item.extend({
        className: "menu-item",
        template: "commands/command.html",
        events: {
            "click a": "run"
        },

        // Constructor
        initialize: function() {
            CommandItem.__super__.initialize.apply(this, arguments);
            return this;
        },

        // template arguments
        templateContext: function() {
            return {
                'command': this.model
            };
        },

        // Finish rendering
        finish: function() {
            // Flags
            this.$el.attr("class", this.className+" "+this.model.get("flags"));
            
            // Tooltip
            this.$("a").tooltip({
                'placement': 'right',
                'delay': {
                    'show': 600,
                    'hide': 0
                }
            });

            // Hide
            if (!this.model.get("visible")) {
                this.$el.hide();
            }

            return CommandItem.__super__.finish.apply(this, arguments);
        },

        // Run command
        run: function(e) {
            if (e) e.preventDefault();

            // Run command
            this.model.run();
        }
    });

    return CommandItem;
});