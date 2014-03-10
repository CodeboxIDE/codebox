define([
    "ace",
    "editor",
    "codecomplete",
    "settings"
], function(ace, FileEditorView, codecomplete, userSettings) {
    var $ = codebox.require("hr/dom");
    var commands = codebox.require("core/commands/toolbar");
    var files = codebox.require("core/files");
    
    var aceconfig = ace.require("ace/config");
    aceconfig.set("basePath", "static/addons/cb.files.editor/ace");

    // Add files handler
    files.addHandler("ace", {
        'name': "Code Editor",
        'fallback': true,
        'setActive': true,
        'position': 1,
        'View': FileEditorView,
        'valid': function(file) {
            return (!file.isDirectory());
        }
    });

    // Return globals
    return {
        'ace': ace
    };
});