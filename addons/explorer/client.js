define([
    "views/explorer"
], function(ExplorerView) {
    var files = codebox.require("utils/files");

    files.addHandler("explorer", {
        name: "Explorer",
        View: ExplorerView,
        valid: function(file) {
            return file.isDirectory();
        }
    });
});