define([
    "themes",
    "views/tab"
], function(THEMES, TerminalTab) {
    var Command = codebox.require("models/command");
    var commands = codebox.require("core/commands/toolbar");
    var box = codebox.require("core/box");
    var tabs = codebox.require("core/tabs");
    var settings = codebox.require("core/settings");
    var menu = codebox.require("core/commands/menu");

    var themes_map = {};
    _.each(THEMES, function(color, name) {
        themes_map[name] = name;
    });

    // Add settings
    settings.add({
        'namespace': "terminal",
        'title': "Terminal",
        'defaults': {
            'font': "monospace",
            'size': 13,
            'line-height': 1.3,            
            'theme': 'monokai_soda'
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
                    "'Lucida Sans Unicode', 'Lucida Grande', sans-serif": "Lucida Sans Unicode",
                    'monaco': "Monaco (Mac OS)",
                    'menlo': "Menlo (Mac OS)",
                    'Ubuntu Mono': "Ubuntu Mono (Ubuntu)",
                    'Consolas': "Consolas (Windows)",
                    'Lucida Console': "Lucida Console (Windows)"
                },
            },
            'size': {
                'label': 'Font size',
                'type': 'number',
                'min': 8,
                'max': 20,
                'step': 1
            },
            'line-height': {
                'label': 'Line height',
                'type': 'number',
                'min': 1,
                'max': 1.9,
                'step': 0.1
            },
            'theme': {
                'label': 'Theme',
                'type': 'select',
                'options': themes_map
            }
        }
    });

    // Add opening command
    var command = commands.register("terminal.open", {
        title: "New Terminal",
        icon: "terminal",
        offline: false,
        shortcuts: [
            "alt+t"
        ]
    }, function(shellId) {
        // Create trminal tab
        var tab = tabs.add(TerminalTab, {
            'shellId': shellId
        }, {
            'section': "terminals"
        });

        // Return the tab
        return tab;
    });

    // List terminals menu
    var terminalsList = Command.register("terminal.list", {
        title: "Open Terminals",
        offline: false,
        type: "menu"
    });

    var refreshList = function() {
        return box.listShells().then(function(shellIds) {
            terminalsList.menu.reset(_.map(shellIds, function(shellId) {
                return {
                    title: shellId,
                    action: function() {
                        command.run(shellId)
                    }
                }
            }));
        });
    };

    // Reset list when events from shells:
    box.on("box:shell:open box:shell:destroy", refreshList);

    // Add the command to file/tools menu
    menu.getById("file").menuSection([
        command,
        terminalsList
    ]);
});