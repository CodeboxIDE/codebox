define([
    "hr/hr",
    "views/commands/manager",
    "views/commands/menu"
], function(hr, CommandsView, MenuView) {
    var MenuCommandItem = hr.List.Item.extend({
        tagName: "div",
        className: "btn-group menu-command-item",
        events: {},

        // Constructor
        initialize: function() {
            MenuCommandItem.__super__.initialize.apply(this, arguments);
            
            this.menu = new MenuView({
                'collection': this.model.menu
            }, this);

            return this;
        },

        // Render the menu item
        render: function() {
            $("<button>", {
                'class': "btn dropdown-toggle",
                'text': this.model.get("title"),
                'data-toggle': "dropdown"
            }).appendTo(this.$el);
            this.menu.$el.appendTo(this.$el);
            return this.ready();
        }
    });

    var MenubarView = CommandsView.extend({
        tagName: "div",
        className: "cb-commands-menubar",
        Item: MenuCommandItem,

        /*
         *  Register a new command
         *
         *  id: unique id for the command
         *  properties: properties to define the command
         *  handler: command handler
         */
        register: function(id, properties, items) {
            properties = _.extend({}, properties, {
                'type': "menu",
                'id': id
            });

            var command = new this.collection.model({}, properties);
            command.menu.reset(items);
            this.collection.add(command);

            return command;
        }
    });

    return MenubarView;
});