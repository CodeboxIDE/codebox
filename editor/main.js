var _ = require("hr.utils");
var $ = require("jquery");
var Q = require("q");

var logger = require("hr.logger")("app");

Q.onerror = function (error) {
    logger.exception("Uncaught Error:", error);
};

var app = require("./core/application");
var commands = require("./core/commands");
var packages = require("./core/packages");
var user = require("./core/user");
var users = require("./core/users");
var settings = require("./core/settings");
var dialogs = require("./utils/dialogs");
var menu = require("./utils/menu");
var File = require("./models/file");

var keybindings = require("./settings/keybindings");
var upload = require("./utils/upload");
var codeboxRequire = require("./utils/require");

// Create the global object for packages
window.codebox = {
    require: codeboxRequire,
    app: app,
    user: user,
    root: new File(),
    settings: settings
};

commands.register({
    id: "settings.open",
    title: "Settings: Open",
    icon: "gear",
    shortcuts: [
        "mod+,"
    ],
    run: function(args, context) {
        return commands.run("file.open", {
            file: settings.getFile()
        });
    }
});

// Start running the applications
logger.log("start application");
Q.delay(500)
.then(codebox.user.whoami.bind(codebox.user))
.then(codebox.root.stat.bind(codebox.root, "./"))
.then(settings.load.bind(settings))
.then(users.listAll.bind(users))
.then(function() {
    return packages.loadAll()
    .fail(function(err) {
        var message = "<p>"+err.message+"</p>";
        if (err.errors) {
            message += "<ul>"+ _.map(err.errors, function(e) {
                return "<li><b>"+_.escape(e.name)+"</b>: "+_.escape(e.error)+"</li>";
            }).join("\n")+ "</ul>";
        }

        return dialogs.alert(message, { isHtml: true })
    });
})
.then(app.start.bind(app))
.fail(function(err) {
    logger.error("Error:", err.message || "", err.stack || err);
    return dialogs.error(err);
});

