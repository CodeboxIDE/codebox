define([], function() {
    var settings = codebox.require("core/settings");

    // Add settings
    var userSettings = settings.add({
        'namespace': "editor",
        'title': "Code Editor",
        'defaults': {
            'theme': "github",
            'fontsize': "12",
            'printmargincolumn': 80,
            'showinvisibles': false,
            'showprintmargin': false,
            'highlightactiveline': false,
            'wraplimitrange': 80,
            'enablesoftwrap': false,
            'enablesofttabs': true,
            'stripspaces': false,
            'autocollaboration': true,
            'tabsize': 4,
            'keyboard': "textinput"
        },
        'fields': {
            'keyboard': {
                'label': "Keyboard mode",
                'type': "select",
                'options': {
                    "vim": "Vim",
                    "emacs": "Emacs",
                    "textinput": "Default"
                }
            },
            'fontsize': {
                'label': "Font Size",
                'type': "number",
                'min':  10,
                'max': 30,
                'step': 1
            },
            'printmargincolumn': {
                'label': "Print Margin Column",
                'type': "number",
                'min':  0,
                'max': 1000,
                'step': 1
            },
            'wraplimitrange': {
                'label': "Wrap Limit Range",
                'type': "number",
                'min':  0,
                'max': 1000,
                'step': 1
            },
            'autocollaboration': {
                'label': "Auto enable realtime collaboration",
                'type': "checkbox"
            },
            'showprintmargin': {
                'label': "Show Print Margin",
                'type': "checkbox"
            },
            'showinvisibles': {
                'label': "Show Invisibles",
                'type': "checkbox"
            },
            'highlightactiveline': {
                'label': "Highlight Active Line",
                'type': "checkbox"
            },
            'enablesoftwrap': {
                'label': "Enable Soft Wrap",
                'type': "checkbox"
            },
            'enablesofttabs': {
                'label': "Use Soft Tabs",
                'type': "checkbox"
            },
            'stripspaces': {
                'label': "Strip Whitespaces",
                'type': "checkbox"
            },
            'tabsize': {
                'label': "Tab Size",
                'type': "number",
                'min':  0,
                'max': 1000,
                'step': 1
            }
        }
    });

    return userSettings;
});