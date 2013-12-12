define([
    "hr/hr",
    "collections/menu",
    "views/menu/item"
], function(hr, Menu, MenuItem) {

    // Menubar list
    var MenubarView = hr.List.extend({
        className: "cb-menu-commands",
        Collection: Menu,
        Item: MenuItem,

        /*
         *  Register a new command
         *
         *  id: unique id for the command
         *  properties: properties to define the command
         *  handler: command handler
         */
        register: function(id, properties, handler) {
            logging.log("register", id, properties);

            properties = _.extend({}, properties, {
                'id': id,
                'handler': handler
            });

            var command = new this.collection.model({}, properties);
            this.collection.add(command);

            // Bind keyboard shortcuts
            _.each(command.get("shortcuts", []), function(shortcut) {
                Keyboard.bind(shortcut, function(e) {
                    e.preventDefault();
                    command.run();
                });
            });

            return command;
        }
    });

    return MenubarView;
});