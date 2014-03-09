define([
    "hr/hr",
    "views/commands/manager",
    "views/commands/menu"
], function(hr, CommandsView, MenuView) {
    var StatusbarView = MenuView.extend({
        className: "cb-commands-menubar"
    });

    return StatusbarView;
});