define([
    "ace",
    "editor",
    "codecomplete",
    "settings"
], function(ace, FileEditorView, codecomplete, userSettings) {
    var $ = codebox.require("hr/dom");
    var commands = codebox.require("core/commands/toolbar");
    var files = codebox.require("core/files");
    var languages = codebox.require("utils/languages");
    
    var aceconfig = ace.require("ace/config");
    aceconfig.set("basePath", "static/addons/cb.files.editor/ace");

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
        fallback: true,
        setActive: true,
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