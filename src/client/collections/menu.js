define([
    "underscore",
    "hr/hr",
    "models/menuitem"
], function(_, hr, MenuItem) {
    var Menu = hr.Collection.extend({
        model: MenuItem,
    });

    return Menu;
});