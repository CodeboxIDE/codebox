define([
    "views/tab"
], function(TerminalTab) {
    var commands = codebox.require("core/commands");
    var tabs = codebox.require("utils/tabs");
    var settings = codebox.require("core/settings");

    // Add settings
    settings.add({
        'namespace': "terminal",
        'title': "Terminal",
        'defaults': {
            'font': "monospace"
        },
        'fields': {
            'font': {
                'label': "Font",
                'type': "select",
                'options': {
                    'monospace': "Monospace",
                    'arial': "Arial",
                    'Courier New': "Courier New",
                    "'MS Sans Serif', Geneva, sans-serif;": "MS Sans Serif",
                    "'Lucida Sans Unicode', 'Lucida Grande', sans-serif": "Lucida Sans Unicode"
                }
            }
        }
    });

    // Add opening command
    commands.register("terminal.open", {
        title: "Terminal",
        icon: "terminal",
        shortcuts: [
            "t"
        ]
    }, function() {
        tabs.open(TerminalTab);
    });
});