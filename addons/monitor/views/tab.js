define([
    "views/logs"
], function(LogsList) {
    var _ = require("Underscore");
    var $ = require("jQuery");
    var hr = require("hr/hr");
    var Tab = require("views/tabs/base")
    var box = require("core/box");

    var MonitorTab = Tab.extend({
        templateLoader: "addon.monitor.templates",
        template: "tab.html",
        className: Tab.prototype.className+ " addon-monitor-tab",
        events: {
            "click .action-monitor-clear": "clearLogs"
        },

        initialize: function(options) {
            MonitorTab.__super__.initialize.apply(this, arguments);
            this.setTabTitle("Monitor");

            this.logs = new LogsList();
            this.logs.on("change:add", function() {
                if (this.animation != null) {
                    this.animation.stop();
                }

                this.animation = this.$(".monitor-logs").animate({
                    scrollTop: this.$(".monitor-logs")[0].scrollHeight
                }, 60);
            }, this);

            box.on("box:log", function(e) {
                this.logs.collection.add(e.data);
            }, this);

            return this;
        },

        finish: function() {
            this.logs.$el.appendTo(this.$(".monitor-logs"));

            return MonitorTab.__super__.finish.apply(this, arguments);
        },

        // Clear all logs
        clearLogs: function(e) {
            if (e) e.preventDefault();
            this.logs.collection.reset([]);
        }
    });

    return MonitorTab;
});