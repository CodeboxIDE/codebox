define([
    "underscore",
    "hr/hr"
], function(_, hr) {
    var Change = hr.Model.extend({
        defaults: {
            // To path
            'toPath': null,

            // From path
            'fromPath': null,

            // Types of modification
            'type': "M", // M: modified, R: removed

            // Time for the modification
            'time': 0
        }
    });

    return Change;
});