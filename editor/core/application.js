var _ = require("hr.utils");
var $ = require("jquery");
var Q = require("q");

var Application = require("hr.app");
var GridView = require("hr.gridview");

// Define base application
var CodeboxApplication = Application.extend({
    el: null,
    className: "main-application",
    name: "Codebox",
    events: {},
    routes: {},

    initialize: function() {
        Application.__super__.initialize.apply(this, arguments);

        this.grid = new GridView({
            columns: 10
        }, this);
        this.grid.$el.addClass("main-grid");
        this.grid.appendTo(this);
    },

    render: function() {
        return this.ready();
    },

    start: function() {
        this.$el.appendTo($("body"));
        return this.update();
    },
});

module.exports =  new CodeboxApplication();
