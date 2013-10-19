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

    User.current.set({
        'name': "Samy",
        'email': "samypesse@gmail.com",
        'userId': "Samy",
        'token': "lol"
    });

    Codebox.current.join(User.current)

    // Define base application
    var Application = hr.Application.extend({
        name: "Codebox",
        template: "main.html",
        metas: {
            "description": "Cloud IDE on a box."
        },
        links: {
            "icon": hr.Urls.static("images/favicon.png")
        }
    });

    var app = new Application();
    app.run();
});