define([
    "hr/hr",
    "collections/commands",
    "views/menu/item"
], function(hr, Commands, MenuItem) {

    // Menubar list
    var MenubarView = hr.List.extend({
        tagName: "div",
        className: "cb-menubar-commands",
        Collection: Commands,
        Item: MenuItem,

        /*
         *  Register a new command
         *
         *  id: unique id for the command
         *  properties: properties to define the command
         *  handler: command handler
         */
        register: function(id, properties, items) {
            properties = _.extend({}, properties, {
                'id': id,
                'menu': items
            });

            var command = new this.collection.model({}, properties);
            this.collection.add(command);

            return command;
        }
    });

    return MenubarView;
});