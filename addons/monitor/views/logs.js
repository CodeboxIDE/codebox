define([
    "collections/logs",
    "less!stylesheets/logs.less"
], function(Logs) {
    var _ = require("underscore");
    var $ = require("jQuery");
    var hr = require("hr/hr");
    var Tab = require("views/tabs/base")
    var box = require("core/box");

    // List Item View
    var LogItem = hr.List.Item.extend({
        templateLoader: "addon.monitor.templates",
        template: "log.html",
        className: "log-item",
        events: {},

        // template arguments
        templateContext: function() {
            return {
                'log': this.model
            };
        }
    });

    // Logs list
    var LogsList = hr.List.extend({
        className: "monitor-logs-list",
        Collection: Logs,
        Item: LogItem,
        defaults: _.defaults({
            
        }, hr.List.prototype.defaults)
    });

    return LogsList;
});