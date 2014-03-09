define([
    'hr/utils',
    'hr/hr',
    'views/commands/statusbar'
], function (_, hr, StatusbarView) {
    // Collection for all statusbar commands
    var statusbar = new StatusbarView();
    
    // Feedback
    statusbar.register("statusbar.sendfeedback", {
        title: "Send Feedback",
        position: 5,
        offline: false,
        search: false
    }, function() {
        window.open("https://github.com/FriendCode/codebox/issues");
    });

    return statusbar;
});