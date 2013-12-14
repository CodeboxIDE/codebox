define([
    'underscore',
    'hr/hr',
    'views/commands/menubar',
    'core/box',
    'core/panels'
], function (_, hr, MenubarView, box, panels) {
    // Collection for all menu commands
    var menu = new MenubarView();
    
    menu.register("view", {
        title: "View",
        position: 5
    }, [
        {
            'type': "action",
            'title': "Show Side Bar",
            'action': function() {
                panels.show();
            }
        },
        {
            'type': "action",
            'title': "Hide Side Bar",
            'action': function() {
                panels.close();
            }
        },
        panels.command
    ]);
    menu.register("file", {
        title: "File",
        position: 0
    });

    return menu;
});