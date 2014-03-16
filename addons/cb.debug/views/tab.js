define([
    "views/section",
    "views/locals",
    "views/backtrace",
    "views/breakpoints",
    "views/console",
    "less!stylesheets/tab.less"
], function( DebugSection, LocalsSection, BacktraceSection, BreakpointsSection, ConsoleSection) {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var hr = codebox.require("hr/hr");
    var Command = codebox.require("models/command");
    var Tab = codebox.require("views/tabs/base");
    var box = codebox.require("core/box");
    var user = codebox.require("core/user");
    var dialogs = codebox.require("utils/dialogs");
    var debugManager = codebox.require("core/debug/manager");

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

            this.dbg = this.options.dbg;
            

            // Create sections
            this.console = new ConsoleSection({
                dbg: this.dbg
            });
            this.locals = new LocalsSection({
                dbg: this.dbg
            });
            this.backtrace = new BacktraceSection({
                dbg: this.dbg
            });
            this.breakpoints = new BreakpointsSection({
                dbg: this.dbg
            });

            // Listen events
            this.listenTo(this.dbg, "close", function() {
                this.closeTab();
            });
            this.listenTo(this.dbg, "update", function() {
                this.updateState();
            });
            this.listenTo(this.dbg, "error", function(err) {
                this.console.addLine({
                    type: "error",
                    content: err.message || err
                });
            });
            this.listenTo(this.dbg, "log", function(message) {
                this.console.addLine({
                    type: "log",
                    content: message
                });
            });

            // Create grids for sections
            this.gridV = new GridView({
                columns: 1
            });
            this.gridH = new GridView({
                columns: 1000
            });

            this.gridH.addView(this.breakpoints);
            this.gridH.addView(this.backtrace);
            this.gridH.addView(this.locals);

            this.gridV.addView(this.gridH);
            this.gridV.addView(this.console);
            this.gridV.appendTo(this);


            // Base commands: start, stop, next, continue, restart
            this.commandStart = new Command({}, {
                title: "Start",
                action: function() {
                    that.dbg.start(that.options.argument);
                }
            });
            this.commandStop = new Command({}, {
                title: "Stop",
                action: function() {
                    that.dbg.stop();
                }
            });
            this.commandNext = new Command({}, {
                title: "Next",
                action: function() {
                    that.dbg.next();
                }
            });
            this.commandContinue = new Command({}, {
                title: "Continue",
                action: function() {
                    that.dbg.cont();
                }
            });
            this.commandRestart = new Command({}, {
                title: "Restart",
                action: function() {
                    that.dbg.restart();
                }
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
                'breakpoints': debugManager.breakpoints.all()
            });

            // Bind event on breakponts changements
            this.listenTo(debugManager.breakpoints, "change", function(e) {
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

            // Bind close tab
            this.on("tab:close", function() {
                this.dbg.close();
            }, this);

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
