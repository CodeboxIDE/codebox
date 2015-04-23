var _ = require("hr.utils");
var $ = require("jquery");
var Q = require("q");
var logger = require("hr.logger")("app");
var Application = require("hr.app");
var GridView = require("hr.gridview");

var dialogs = require("../utils/dialogs");
var workspace = require("./workspace");

// Define base application
var CodeboxApplication = Application.extend({
    el: null,
    className: "main-application",
    name: "Codebox",
    events: {},
    routes: {},

    initialize: function() {
        CodeboxApplication.__super__.initialize.apply(this, arguments);

        this.grid = new GridView({
            columns: 10
        }, this);
        this.grid.$el.addClass("main-grid");
        this.grid.appendTo(this);

        // Signal offline
        function updateOnlineStatus(event) {
            logger.log("connection changed", navigator.onLine);
            if (!navigator.onLine) {
                dialogs.alert("It looks like you lost your internet connection. The IDE requires an internet connection.");
            } else {
                dialogs.alert("Your internet connection is up again. Restart your navigator tab to ensure that codebox works perfectly.");
            }
        }
        window.addEventListener('online',  updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
    },

    render: function() {
        this.head.title(workspace.get('title'));
        return this.ready();
    },

    start: function() {
        this.$el.appendTo($("body"));
        return this.update();
    },
});

module.exports = new CodeboxApplication();
