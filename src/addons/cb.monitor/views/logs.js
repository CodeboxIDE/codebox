define([
    "collections/logs",
    "text!templates/log.html",
    "less!stylesheets/logs.less"
], function(Logs, templateFile) {
    var _ = codebox.require("underscore");
    var $ = codebox.require("jQuery");
    var hr = codebox.require("hr/hr");
    var Tab = codebox.require("views/tabs/base")
    var box = codebox.require("core/box");

    // List Item View
    var LogItem = hr.List.Item.extend({
        templateLoader: "text",
        template: templateFile,
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