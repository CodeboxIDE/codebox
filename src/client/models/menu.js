define([
    "underscore",
    "hr/hr"
], function(_, hr) {
    var Menu = hr.Model.extend({
        defaults: {
            'items': []
        },

        // Return list of items
        items: function() {
            var menuItems = this.get("items", []);
            if (_.isFunction(menuItems)) menuItems = menuItems();
            return menuItems;
        }
    });

    return Menu;
});