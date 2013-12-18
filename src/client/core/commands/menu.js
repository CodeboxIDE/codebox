define([
    'underscore',
    'hr/hr',
    'views/commands/menubar',
    'core/box',
    'core/panels',
    'core/tabs',
    'core/session'
], function (_, hr, MenubarView, box, panels, tabs, session) {
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
    }).menuSection([{
        'id': "quit",
        'title': "Quit",
        'shortcuts': ["mod+q"],
        'action': session.exit
    }], {
        'position': 1000
    });

    menu.register("tools", {
        title: "Tools"
    });

    return menu;
});