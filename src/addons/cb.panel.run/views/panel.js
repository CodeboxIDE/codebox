define([], function() {
    var _ = codebox.require("underscore");
    var $ = codebox.require("jQuery");
    var hr = codebox.require("hr/hr");
    var box = codebox.require("core/box");
    var dialogs = codebox.require("utils/dialogs");
    var PanelBaseView = codebox.require("views/panels/base");

    var PanelRunView = PanelBaseView.extend({
        className: "cb-panel-run",
        template: "panel.html",
        templateLoader: "addon.cb.panel.run.templates",
        events: {
            "click .cb-action-run": "runApp",
            "click .cb-action-ports-refresh": "refreshPorts",
            "click li[data-run-port]": "openPortApp"
        },

        initialize: function() {
            PanelRunView.__super__.initialize.apply(this, arguments);
            this.ports = [];
            this.refreshPorts();
        },

        templateContext: function() {
            return {
                ports: this.ports
            }
        },

        // refresh the ports lists
        refreshPorts: function(e) {
            var that = this;
            if (e) e.preventDefault();
            box.procHttp().then(function(ports) {
                that.ports = ports;
                that.update();
            });
        },

        // Start the application
        runApp: function(e) {
            if (e) e.preventDefault();
            dialogs.alert("Auto-run is not yet available", "Run your application from the terminal on port 5000 and open your applications from the list below.")
        },

        // Open the port url
        openPortApp: function(e) {
            if (!e) return;
            var port = $(e.currentTarget).data("run-port");
            alert(port);
        }
    });

    return PanelRunView;
});