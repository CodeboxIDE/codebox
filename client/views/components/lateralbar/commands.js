define([
    "hr/hr",
    "collections/commands"
], function(hr, Commands) {

    // List Item View
    var CommandItem = hr.List.Item.extend({
        className: "menu-item",
        template: "components/lateralbar/command.html",
        events: {
            "click a": "run"
        },

        templateContext: function() {
            return {
                'command': this.model
            };
        },

        // Finish rendering
        finish: function() {
            this.$("a").tooltip({
                'placement': 'right',
                'delay': {
                    'show': 600,
                    'hide': 0
                }
            });

            return CommandItem.__super__.finish.apply(this, arguments);
        },

        // Run command
        run: function(e) {
            if (e) e.preventDefault();
            this.model.run();
        }
    });

    // Commands list
    var CommandsList = hr.List.extend({
        className: "menu-commands",
        Collection: Commands,
        Item: CommandItem,
        defaults: _.defaults({
            
        }, hr.List.prototype.defaults)
    });

    hr.View.Template.registerComponent("component.lateralbar.commands", CommandsList);

    return CommandsList;
});