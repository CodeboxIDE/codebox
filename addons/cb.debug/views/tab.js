define([
    "less!stylesheets/tab.less"
], function() {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var hr = codebox.require("hr/hr");
    var Tab = codebox.require("views/tabs/base");
    var box = codebox.require("core/box");
    var user = codebox.require("core/user");

    var GridView = codebox.require("views/grid");

    var DebugTab = Tab.extend({
        className: Tab.prototype.className+ " addon-debugger-tab",
        defaults: {
            
        },
        menuTitle: "Debugger",
        events: {
            
        },

        initialize: function(options) {
            var that = this;
            DebugTab.__super__.initialize.apply(this, arguments);

            // Create grid for sections
            this.grid = new GridView({
                columns: 1000
            });
            this.grid.addView(new hr.View());
            this.grid.addView(new hr.View());
            this.grid.addView(new hr.View());
            this.grid.appendTo(this);
            
            // Describe debug tab
            this.setTabTitle("Debugger");
            this.menu.menuSection([
                {
                    'type': "checkbox",
                    'title': "Exit",
                    'action': function(state) {
                        that.closeTab();
                    }
                }
            ]);

            return this;
        },

        // Render
        render: function() {
            return this.ready();
        }
    });

    return DebugTab;
});
