define([
    "views/file",
    "ace/ace",
    "ace/ext/modelist",
    "ace/ext/themelist"
], function(FileEditorView, ace, aceModes, aceThemes) {
    var $ = codebox.require("jQuery");
    var commands = codebox.require("core/commands");
    var tabs = codebox.require("utils/tabs");
    var settings = codebox.require("core/settings");
    var files = codebox.require("core/files");
    var config = codebox.require("config");
    var languages = codebox.require("utils/languages");

    // Configure ace
    var aceconfig = ace.require("ace/config");
    aceconfig.set("basePath", "static/addons/editor/ace");

    // Build themes map
    var themesMap = {};
    _.each(aceThemes.themes, function(theme) {
        themesMap[theme.name] = theme.desc;
    })

    // Add settings
    settings.add({
        'namespace': "aceeditor",
        'title': "Code Editor",
        'defaults': {
            'theme': "github",
            'fontsize': "12",
            'printmargincolumn': 80,
            'showprintmargin': false,
            'highlightactiveline': false,
            'wraplimitrange': 80,
            'enablesoftwrap': false,
            'keyboard': "textinput"
        },
        'fields': {
            'theme': {
                'label': "Theme",
                'type': "select",
                'options': themesMap
            },
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

    // Build code files extensions list
    var textExts = _.reduce(languages.LIST, function(list, language) {
        list = list.concat(language.extensions || []);
        if (language.primary_extension) list.push(language.primary_extension);
        return list;
    }, [
        // Defaults extensions
        '.txt'
    ]);

    // List of mime type
    var mimeTypes = [
        "text/plain"
    ];

    // Add files handler
    files.addHandler("ace", {
        name: "Code Editor",
        View: FileEditorView,
        valid: function(file) {
            return (!file.isDirectory()
            && (_.contains(textExts, file.extension()) || _.contains(mimeTypes, file.get("mime"))));
        }
    });

    // Return globals
    return {
        'ace': ace
    };
});