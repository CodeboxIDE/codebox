define(["views/dialog"], function(HelpDialog) {
    var app = codebox.require("core/app");
    var dialogs = codebox.require("utils/dialogs");
    var menu = codebox.require("core/menu");

    // Add menu
    menu.register("help", {
        title: "Help",
        position: 100
    }, [
        {
            'id': "help",
            'title': "Documentation",
            'shortcuts': ['?'],
            'action': function() {
                dialogs.open(HelpDialog);
            }
        },
        { 'type': "divider" },
        {
            'id': "feedback",
            'title': "Submit feedback",
            'action': function() {
                window.open("https://github.com/FriendCode/codebox/issues");
            }
        }
    ]);
});

