define([
    'underscore',
    'hr/hr',
    'views/commands/menubar',
    'core/box',
    'core/panels',
    'core/tabs'
], function (_, hr, MenubarView, box, panels, tabs) {
    // Collection for all menu commands
    var menu = new MenubarView();
    
    menu.register("view", {
        title: "View",
        position: 5
    }).menuSection([
        panels.visibilityCommand,
        panels.panelsCommand
    ]).menuSection([
        tabs.layoutCommand
    ]);

    menu.register("file", {
        title: "File",
        position: 0
    });

    return menu;
});