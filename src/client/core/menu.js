define([
    'underscore',
    'hr/hr',
    'views/menu/manager',
    'core/box'
], function (_, hr, MenubarView, box) {
    // Collection for all menu commands
    var menu = new MenubarView();

    // Add base menu item
    var menuItem = menu.register("project", {
        title: "Untitled",
        position: 0
    }, [
        {
            'type': "action",
            'text': "Settings",
            'command': "settings.open"
        }
    ]);

    // Title changed
    box.on("change:name", function() {
        menuItem.set("title", box.get("name"));
    });

    return menu;
});