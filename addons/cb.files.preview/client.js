define([
    "views/preview_html",
    "views/preview_markdown"
], function(PreviewHtml, PreviewMarkdown) {
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
    
    var markdownExts = [
        ".md", ".markdown", ".txt"
    ];
    
    files.addHandler("preview-markdown", {
        name: "Preview",
        icon: "eye",
        position: 10,
        View: PreviewMarkdown,
        valid: function(file) {
            return (!file.isDirectory() && _.contains(markdownExts, file.extension()));
        }
    });
});