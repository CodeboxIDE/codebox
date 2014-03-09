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
            this._closed = false;

            if (!this.manager) {
                throw "Need a manager to create a tab";
            }
        },

        // Get previous tab
        getNthTab: function(collection, n) {
            var prev = null;
            collection = collection || this.section;

            var i = collection.indexOf(this);

            // tab not found
            if (i < 0) return;
            i = i + n;

            if (i < 0 || i >= collection.size()) return null;

            return collection.models[i];
        },

        // Get previous tab
        prevTab: function(collection) {
            return this.getNthTab(collection, -1);
        },

        // Get next tab
        nextTab: function(collection) {
            return this.getNthTab(collection, +1);
        },

        // Return true if this tab is active
        isActive: function() {
            return this.get("active");
        },

        // Active this tab on the current section
        active: function() {
            this.section.each(function(tab) {
                tab.set("active", tab.id == this.id);
            }, this);
            this.manager.activeTab = this.id;
            this.manager.activeSection = this.section.sectionId;
            this.manager.trigger("active", this);
        },

        // Disactive
        disactive: function() {
            this.model.set("active", false);
        },

        // Change tab section
        changeSection: function(section) {
            return this.manager.changeTabSection(this, section);
        },

        // Split section
        splitSection: function() {
            this.changeSection(_.uniqueId("section"));
        },

        // Close this tab
        close: function(force) {
            var that = this, tabid = this.id, prev = null;

            if (this._closed) return Q.reject(new Error("Tab already been closed"));
            

            var handleClose = function(state) {
                if ((!state && !force) || this._closed) return;

                that._closed = true;

                if (that.isActive()) {
                    // Change active tab to an another tab with priority order:
                    prev = that.prevTab() || that.nextTab() || that.prevTab(that.manager.tabs) || that.nextTab(that.manager.tabs);
                }

                // Triger in tab
                that.view.trigger("tab:close");
                that.view.remove();

                // Trigger global
                that.manager.trigger("tab:"+tabid+":close");
                that.manager.trigger("tabs:close", tabid);

                if (prev) prev.active();

                that.destroy();

                that.manager.checkSections();

                // No tab -> open default
                if (that.manager.tabs.size() == 0) that.manager.openDefault();

                return Q(tabid);
            };

            // Check that we can close the tab
            return Q(this.view.tabCanBeClosed())
            .then(handleClose, handleClose);
        },

        // Close all other tabs in the section
        closeOthers: function() {
            this.section.each(function(tab) {
                if (tab.id != this.id) tab.close();
            }, this);
            this.active();
        },

        // Return a snapshot of current tab
        snapshot: function() {
            return {
                'id': this.id,
                'type': this.get("type"),
                'section': this.section.sectionId,
                'active': this.isActive()
            };
        }
    });

    return Tab;
});