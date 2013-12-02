define([
    "views/tab"
], function(TerminalTab) {
    var commands = codebox.require("core/commands");
    var tabs = codebox.require("core/tabs");
    var settings = codebox.require("core/settings");

    // Add settings
    settings.add({
        'namespace': "terminal",
        'title': "Terminal",
        'defaults': {
            'font': "monospace",
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
                    "'Lucida Sans Unicode', 'Lucida Grande', sans-serif": "Lucida Sans Unicode"
                },
            },
            'theme': {
                'label': 'Theme',
                'type': 'select',
                'options': {
                    "blazer": "blazer",
                    "chalkboard": "chalkboard",
                    "dark_pastel": "dark_pastel",
                    "desert": "desert",
                    "espresso": "espresso",
                    "github": "github",
                    "grass": "grass",
                    "homebrew": "homebrew",
                    "hurtado": "hurtado",
                    "idletoes": "idletoes",
                    "kibble": "kibble",
                    "man_page": "man_page",
                    "monokai_soda": "monokai_soda",
                    "neopolitan": "neopolitan",
                    "novel": "novel",
                    "ocean": "ocean",
                    "pro": "pro",
                    "red_sands": "red_sands",
                    "seafoam_pastel": "seafoam_pastel",
                    "solarized_darcula": "solarized_darcula",
                    "solarized_dark": "solarized_dark",
                    "solarized_light": "solarized_light",
                    "symfonic": "symfonic",
                    "terminal_basic": "terminal_basic",
                    "vaughn": "vaughn",
                    "zenburn": "zenburn",
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
        tabs.add(TerminalTab, {}, {
            'section': "terminals"
        });
    });
});