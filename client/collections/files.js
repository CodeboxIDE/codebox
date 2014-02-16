define([
    "hr/utils",
    "hr/hr",
    "models/file"
], function(_, hr, File) {
    var Files = hr.Collection.extend({
        model: File
    });

    return Files;
});