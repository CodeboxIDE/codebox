define([
    'underscore',
    'hr/hr',
    'views/commands/menubar',
    'core/box',
    'core/panels'
], function (_, hr, MenubarView, box, panels) {
    // Collection for all menu commands
    var menu = new MenubarView();
    
    console.log(panels.command);
    menu.register("view", {
        title: "View",
        position: 5
    }, [
        panels.command
    ]);
    menu.register("file", {
        title: "File",
        position: 0
    });

    /*, [
        {
            'type': "action",
            'text': "Show Side Bar",
            'action': function() {
                panels.show();
            }
        },
        {
            'type': "action",
            'text': "Hide Side Bar",
            'action': function() {
                panels.close();
            }
        }
    ]);*/

    return menu;
});