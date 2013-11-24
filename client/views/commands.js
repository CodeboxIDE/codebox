define([
    "hr/hr",
    "collections/commands"
], function(hr, Commands) {

    // List Item View
    var CommandItem = hr.List.Item.extend({
        className: "menu-item",
        template: "command.html",
        events: {
            "click a": "run"
        },

        // Constructor
        initialize: function() {
            CommandItem.__super__.initialize.apply(this, arguments);
            this.model.menuItem = this;
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

    // Commands list
    var CommandsList = hr.List.extend({
        className: "cb-menu-commands",
        Collection: Commands,
        Item: CommandItem,
        defaults: _.defaults({
            
        }, hr.List.prototype.defaults)
    });

    hr.View.Template.registerComponent("component.lateralbar.commands", CommandsList);

    return CommandsList;
});