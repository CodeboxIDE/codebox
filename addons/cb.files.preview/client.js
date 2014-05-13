define([
    "views/preview"
], function(PreviewView) {
    var _ = codebox.require("hr/utils");
    var files = codebox.require("core/files");

    var htmlExts = [
        ".html", ".htm"
    ];

    files.addHandler("preview", {
        name: "Preview",
        position: 10,
        View: PreviewView,
        valid: function(file) {
            return (!file.isDirectory() && _.contains(htmlExts, file.extension()));
        }
    });
});