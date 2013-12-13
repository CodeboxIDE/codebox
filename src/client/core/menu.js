define([
    'underscore',
    'hr/hr',
    'views/menu/manager',
    'core/box',
    'core/panels'
], function (_, hr, MenubarView, box, panels) {
    // Collection for all menu commands
    var menu = new MenubarView();

    // Add project menu
    var menuItem = menu.register("project", {
        title: "Workspace",
        position: 0
    }, [
        {
            'type': "action",
            'text': "Settings",
            'command': "settings.open"
        },
        { 'type': "divider" },
        {
            'type': "action",
            'text': "Quit this Workspace",
            'command': "quit"
        }
    ]);

    // Title changed
    /*box.on("change:name", function() {
        menuItem.set("title", box.get("name"));
    });*/


    // Add view menu
    menu.register("view", {
        title: "View",
        position: 5
    }, [
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
    ]);

    return menu;
});