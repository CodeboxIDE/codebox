define([
    "hr/hr",
    "views/commands/manager"
], function(hr, CommandsView) {

    // List Item View
    var CommandItem = hr.List.Item.extend({
        className: "menu-item",
        template: "commands/command.html",
        events: {
            "click a": "run"
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
                'placement': 'bottom',
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

    var CommandsToolbar = CommandsView.extend({
        className: "cb-commands-toolbar",
        Item: CommandItem,
    });

    return CommandsToolbar;
});