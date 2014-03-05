define([
    "hr/hr",
    "views/commands/manager",
    "text!resources/templates/commands/command.html"
], function(hr, CommandsView, templateFile) {

    // List Item View
    var CommandItem = CommandsView.CommandItem.extend({
        className: "menu-item",
        template: templateFile,
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
            this.$el.attr("class", this.className+" "+this.getFlagsClass());
            
            // Tooltip
            this.$("a").tooltip({
                'placement': 'right',
                'delay': {
                    'show': 300,
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