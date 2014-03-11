define([
    "debugger",
    "views/section",
    "views/locals",
    "views/backtrace",
    "views/breakpoints",
    "less!stylesheets/tab.less"
], function(Debugger, DebugSection, LocalsSection, BacktraceSection, BreakpointsSection) {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var hr = codebox.require("hr/hr");
    var breakpoints = codebox.require("core/debug/breakpoints");
    var Command = codebox.require("models/command");
    var Tab = codebox.require("views/tabs/base");
    var box = codebox.require("core/box");
    var user = codebox.require("core/user");
    var dialogs = codebox.require("utils/dialogs");

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

            this.dbg = new Debugger();
            this.listenTo(this.dbg, "update", function() {
                this.updateState();
            });

            // Create sections
            this.locals = new LocalsSection({
                dbg: this.dbg
            });
            this.backtrace = new BacktraceSection({
                dbg: this.dbg
            });
            this.breakpoints = new BreakpointsSection({
                dbg: this.dbg
            });

            // Create grid for sections
            this.grid = new GridView({
                columns: 1000
            });

            this.grid.addView(this.breakpoints);
            this.grid.addView(this.backtrace);
            this.grid.addView(this.locals);

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
            this.setTabTitle("Debugger "+this.options.path);

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
                this.commandRestart,
                this.commandContinue,
                this.commandNext,
                this.commandStop,
                this.commandStart
            ]);

            // Start debugger
            this.dbg.init({
                'tool': this.options.tool,
                'path': this.options.path,
                'breakpoints': breakpoints.all()
            });

            // Bind event on breakponts changements
            this.listenTo(breakpoints, "change", function(e) {
                if (e.change == "add") {
                    this.dbg.breakpointAdd({
                        'path': e.path,
                        'line': e.line
                    });
                } else {
                    var point = this.dbg.getBreakpoint({
                        'path': e.path,
                        'line': e.line
                    });

                    if (point) this.dbg.breakpointRemove(point.num);
                }
            });

            return this;
        },

        // Render
        render: function() {
            return this.ready();
        },


        // Update debugegr state: stack, locals
        updateState: function() {
            this.locals.update();
            this.backtrace.update();
            this.breakpoints.update();
        }
    });

    return DebugTab;
});
