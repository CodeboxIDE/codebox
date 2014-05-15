define([
    "views/preview_html"
], function(PreviewHtml) {
    var _ = codebox.require("hr/utils");
    var files = codebox.require("core/files");

    var htmlExts = [
        ".html", ".htm"
    ];

    files.addHandler("preview", {
        name: "Preview",
        icon: "eye",
        position: 10,
        View: PreviewHtml,
        valid: function(file) {
            return (!file.isDirectory() && _.contains(htmlExts, file.extension()));
        }
    });
});