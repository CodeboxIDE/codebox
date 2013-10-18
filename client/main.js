require([
    "Underscore",
    "hr/hr",
    "hr/args",

    "codebox/box",
    "codebox/user",

    "views/views",
    "resources/resources"
], function(_, hr, args, Codebox, User) {
    // Configure hr
    hr.configure(args);

    // Codebox
    Codebox.current = new Codebox();
    User.current = new User();

    // Extend template context
    hr.Template.extendContext({
        'box': Codebox.current,
        'user': User.current
    });

    // Define base application
    var Application = hr.Application.extend({
        name: "Hello",
        template: "main.html",
        metas: {
            "description": "Base application using HappyRhino."
        },
        links: {
            "icon": hr.Urls.static("images/favicon.png")
        },
        events: {},

        /*
         *  Constructor
         */
        initialize: function() {
            Application.__super__.initialize.apply(this, arguments);

            return this;
        },

        /*
         *  Finish rendering
         */
        finish: function() {
            Application.__super__.finish.apply(this, arguments);
            return this;
        },
    });

    var app = new Application();
    app.run();
});