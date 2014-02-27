define([
    "hr/utils",
    "hr/hr"
], function(_, hr) {
    var Tab = hr.Model.extend({
        defaults: {
            "id": null,
            "title": "",
            "state": "",
            "active": false
        },

        initialize: function() {
            Tab.__super__.initialize.apply(this, arguments);
            this.manager = this.options.manager;

            if (!this.manager) {
                throw "Need a manager to create a tab";
            }
        },

        // Return true if this tab is active
        isActive: function() {
            return this.get("active");
        },

        // Active this tab
        active: function() {
            this.collection.each(function(tab) {
                tab.set("active", tab.id == this.id);
            }, this);
        },

        // Disactive
        disactive: function() {
            this.model.set("active", false);
        },

        // Close this tab
        close: function(force) {
            var that = this, tabid = this.id;

            var handleClose = function(state) {
                if (!state && !force) return;

                if (!that.isActive()) {
                    // Change active tab
                }

                // Triger in tab
                that.view.trigger("tab:close");
                that.view.off();

                delete that.view;

                // Trigger global
                that.manager.trigger("tab:"+tabid+":close");
                that.manager.trigger("tabs:close", tabid);

                /*if (!_.size(that.tabs) || !previousTabId) {
                    that.trigger("tabs:default");
                } else {
                    that.open(previousTabId);
                }*/

                that.destroy();

                return Q(tabid);
            };

            // Check that we can close the tab
            return Q(this.view.tabCanBeClosed())
            .then(handleClose, handleClose);
        }
    });

    return Tab;
});