define([
    "underscore",
    "hr/hr"
], function(_, hr) {
    var MenuItem = hr.Model.extend({
        defaults: {
            'type': "divider",
            'text': "",
            'action': function() {}
        }
    });

    return MenuItem;
});