define([
    "views/tab",
    "ace/ace"
], function(EditorTab, ace) {
    var $ = codebox.require("jQuery");
    var commands = codebox.require("core/commands");
    var tabs = codebox.require("utils/tabs");
    var settings = codebox.require("utils/settings");
    var config = codebox.require("config");

    // Configure ace
    // ace version used is the content of https://github.com/ajaxorg/ace/tree/master/lib/ace
    var aceconfig = ace.require("ace/config");
    aceconfig.set("basePath", "static/addons/editor/ace");

    // Add settings
    settings.add({
        'namespace': "editor",
        'title': "Editor",
        'defaults': {
            'theme': config.editor.default_theme,
            'fontsize': "12",
            'printmargincolumn': 80,
            'showprintmargin': false,
            'highlightactiveline': false,
            'wraplimitrange': 80,
            'enablesoftwrap': false,
            'keyboard': config.editor.default_keyboard
        },
        'fields': {
            'theme': {
                'label': "Theme",
                'type': "select",
                'options': config.editor.themes
            },
            'keyboard': {
                'label': "Keyboard mode",
                'type': "select",
                'options': config.editor.keyboards
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
            'showprintmargin': {
                'label': "Show Print Margin",
                'type': "checkbox"
            },
            'highlightactiveline': {
                'label': "Highlight Active Line",
                'type': "checkbox"
            },
            'enablesoftwrap': {
                'label': "Enable Soft Wrap",
                'type': "checkbox"
            }
        }
    });

    // Tabs manager
    var manager = tabs.manager();

    // Add opening command
    commands.register("files.open", {
        title: "Files",
        icon: "folder-o"
    }, function(args) {
        args = _.defaults({}, args || {}, {
            'path': "/"
        });

        var tab = manager.getActiveTabByType("directory");
        if (tab != null && ! manager.checkTabExists(args.path)) {
            // Change current tab to open the file
            tab.view.load(args.path);
        } else {
            // Add new tab
            tabs.open(EditorTab, {
                "path": args.path
            }, {
                "uniqueId": args.path,
                "type": "file",
            });
        }
    });

    // Add as default tabs
    manager.on("tabs:default", function() {
        commands.run("files.open");
    });

    // Open base tabs
    commands.run("files.open");
});