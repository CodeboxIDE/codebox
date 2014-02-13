define([], function() {
    var _ = codebox.require("underscore");
    var dialogs = codebox.require("utils/dialogs");
    var box = codebox.require("core/box");
    var rpc = codebox.require("core/backends/rpc");
    var Command = codebox.require("models/command");
    var menu = codebox.require("core/commands/menu");

    var addCommand = Command.register("deploy.configure", {
        title: "Add Solution",
        action: function(page) {
            dialogs.fields("Add Deployment Solution", {
                name: {
                    type: "text",
                    label: "Label"
                },
                solution: {
                    type: "select",
                    label: "Type",
                    options: {
                        'heroku': "Heroku",
                        'ghpages': "GitHub Pages",
                        'ftp': "FTP",
                        'sftp': "SFTP"
                    }
                }
            }).then(function(data) {
                
            });
        }
    });

    // Deploy Menu
    var deployMenu = menu.register("deploy", {
        title: "Deploy"
    }).menuSection([
        addCommand
    ]);

    // Update list of solutions
    var updateSolutions = function() {
        return;
    };
});