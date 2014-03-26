define([
    "ace",
    "editor/view"
], function(ace, FileEditorView) {
    var $ = codebox.require("hr/dom");
    var commands = codebox.require("core/commands/toolbar");
    var files = codebox.require("core/files");
    
    var aceconfig = ace.require("ace/config");
    aceconfig.set("basePath", "static/addons/cb.files.editor/ace");

    // Add files handler
    files.addHandler("ace", {
        'name': "Edit",
        'fallback': true,
        'setActive': true,
        'position': 5,
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