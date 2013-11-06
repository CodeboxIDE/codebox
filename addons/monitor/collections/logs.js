define([
    "models/log"
], function(Log) {
    var hr = require("hr/hr");

    var Logs = hr.Collection.extend({
        model: Log
    });

    return Logs;
});