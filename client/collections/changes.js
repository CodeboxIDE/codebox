define([
    "hr/utils",
    "hr/hr",
    "models/change"
], function(_, hr, Change) {
    var Changes = hr.Collection.extend({
        model: Change,

        // Sort comparator
        comparator: function(command) {
            return command.get("path", "").length;
        },

        // Apply all
        applyAll: function() {
            console.log("apply all changes", this.size());
            return this.reduce(function(prev, change) {
                console.log("next ", change, prev);
                return prev.then(function() {
                    return change.apply();
                })
            }, Q());
        }
    });

    return Changes;
});