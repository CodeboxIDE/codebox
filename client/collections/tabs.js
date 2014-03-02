define([
    "hr/utils",
    "hr/hr",
    "models/tab"
], function(_, hr, Tab) {
    var Tabs = hr.Collection.extend({
        model: Tab,

        // Return a tab by its id
        getById: function(id) {
            return this.find(function(tab) {
                return tab.id == id;
            });
        },

        // Return current active tab
        getActive: function() {
            return this.find(function(tab) {
                return tab.get("active");
            });
        },
    });

    return Tabs;
});