define([
    "hr/utils",
    "hr/hr"
], function(_, hr) {
    var Tab = hr.Model.extend({
        defaults: {
            "id": null,
            "title": "",
            "state": null,
            "active": false
        }
    });

    return Tab;
});