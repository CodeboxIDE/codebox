define([
    "views/logs",
    "text!templates/tab.html",
    "less!stylesheets/tab.less"
], function(LogsList, templateFile) {
    var _ = codebox.require("underscore");
    var $ = codebox.require("jQuery");
    var hr = codebox.require("hr/hr");
    var Tab = codebox.require("views/tabs/base")
    var box = codebox.require("core/box");

    var MonitorTab = Tab.extend({
        templateLoader: "text",
        template: templateFile,
        className: Tab.prototype.className+ " addon-monitor-tab",
        events: {
            "click .action-monitor-clear": "clearLogs",
            "keyup .filter-query": "filterLogs"
        },

        initialize: function(options) {
            MonitorTab.__super__.initialize.apply(this, arguments);
            this.setTabTitle("Logging Output");

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
        },

        // Filter logs
        filterLogs: function(e) {
            var q = this.$(".filter-query").val().toLowerCase();
            this.logs.filter(function(log) {
                return log.get("section", "").toLowerCase().search(q) >= 0;
            }, this)
        }
    });

    return MonitorTab;
});