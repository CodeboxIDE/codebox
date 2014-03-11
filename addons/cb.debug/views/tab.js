define([
    "breakpoints",
    "views/section",
    "views/locals",
    "views/backtrace",
    "views/breakpoints",
    "less!stylesheets/tab.less"
], function(breakpoints, DebugSection, LocalsSection, BacktraceSection, BreakpointsSection) {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var hr = codebox.require("hr/hr");
    var rpc = codebox.require("core/backends/rpc");
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

            // Create sections
            this.locals = new LocalsSection();
            this.backtrace = new BacktraceSection();
            this.breakpoints = new BreakpointsSection();

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
            this.initDebugger();

            // Bind event on breakponts changements
            this.listenTo(breakpoints, "change", function(e) {
                console.log("send to debugger breakpoint", e.change, e.path, e.line);
                if (e.change == "add") {
                    this.breakpointAdd({
                        'path': e.path,
                        'line': e.line
                    });
                } else {
                    var point = this.getBreakpoint({
                        'path': e.path,
                        'line': e.line
                    });

                    if (point) this.breakpointRemove(point.num);
                }
            });

            return this;
        },

        // Initialize the debugger
        initDebugger: function() {
            var that = this;
            return rpc.execute("debug/init", {
                'tool': this.options.tool,
                'path': this.options.path,
                'breakpoints': breakpoints.all()
            })
            // Update states
            .then(function() {
                return that.updateState();
            })
        },

        // Get a breapoint id from its location
        getBreakpoint: function(location) {
            return _.find(this.breakpoints.list, function(point) {
                return point.filename == location.path && point.line == location.line;
            });
        },

        // Add a breakpoint
        breakpointAdd: function(args) {
            var that = this;
            rpc.execute("debug/breakpoint/add", args)
            .then(function() {
                return that.updateState();
            });
        },

        // Remove a breakpoint
        breakpointRemove: function(num) {
            var that = this;
            rpc.execute("debug/breakpoint/clear", {
                'id': num
            })
            .then(function() {
                return that.updateState();
            });
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
