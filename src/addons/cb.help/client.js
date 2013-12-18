define(["views/dialog"], function(HelpDialog) {
    var app = codebox.require("core/app");
    var dialogs = codebox.require("utils/dialogs");
    var menu = codebox.require("core/commands/menu");

    // Add menu
    menu.register("help", {
        title: "Help",
        position: 100
    }).menuSection([
        {
            'id': "help.documentation",
            'title': "Documentation",
            'shortcuts': ['?'],
            'action': function() {
                dialogs.open(HelpDialog);
            }
        }
    ]).menuSection([
        {
            'id': "help.feedback",
            'title': "Submit feedback",
            'action': function() {
                window.open("https://github.com/FriendCode/codebox/issues");
            }
        }
    ]);
});

