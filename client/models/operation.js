define([
    "underscore",
    "hr/hr"
], function(_, hr) {
    var logging = hr.Logger.addNamespace("operations");

    var Operation = hr.Model.extend({
        defaults: {
            // Id for the operation
            "id": null,

            // Title to display instead of the id
            "title": null,

            // (int) Progress
            'progress': null,

            // Icon to show
            'icon': "fa-refresh fa-spin"
        },

        // Update progress
        progress: function(p) {
            this.set("progress", p);
            return this;
        }
    });

    return Operation;
});