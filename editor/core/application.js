define([
    "hr/utils",
    "hr/dom",
    "hr/promise",
    "hr/hr",
    "views/grid",
    "core/commands",
    "core/packages"
], function(_, $, Q, hr, GridView, commands, packages) {
    // Define base application
    var Application = hr.Application.extend({
        el: null,
        className: "main-application",
        name: "Codebox",
        events: {

        },
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

        run: function() {
            $(".main-login").remove();
            this.$el.appendTo($("body"));

            return Application.__super__.run.apply(this, arguments);
        },
    });

    var app = new Application();
    return app;
});
