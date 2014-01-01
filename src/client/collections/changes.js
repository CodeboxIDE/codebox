define([
    "underscore",
    "hr/hr",
    "models/change"
], function(_, hr, Change) {
    var Changes = hr.Collection.extend({
        model: Change,

        // Sort comparator
        comparator: function(command) {
            return command.get("path", "").length;
        }
    });

    return Changes;
});