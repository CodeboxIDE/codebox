define([
    "less!stylesheets/tab.less"
], function() {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var hr = codebox.require("hr/hr");
    var Command = codebox.require("models/command");
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


            // Base commands: start, stop, next, continue, restart
            this.commandStart = new Command({}, {
                title: "Start"
            });
            this.commandStop = new Command({}, {
                title: "Stop"
            });
            this.commandNext = new Command({}, {
                title: "Next"
            });
            this.commandContinue = new Command({}, {
                title: "Continue"
            });
            this.commandRestart = new Command({}, {
                title: "Restart"
            });
            
            // Describe debug tab
            this.setTabTitle("Debugger");

            // Tab menu
            this.menu
            .menuSection([
                this.commandStart,
                this.commandStop,
                this.commandRestart
            ])
            .menuSection([
                this.commandNext,
                this.commandContinue
            ])
            .menuSection([
                {
                    'type': "checkbox",
                    'title': "Exit",
                    'action': function(state) {
                        that.closeTab();
                    }
                }
            ]);

            // Statusbar menu
            this.statusbar.add([
                this.commandStart,
                this.commandStop,
                this.commandNext,
                this.commandContinue,
                this.commandRestart
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
