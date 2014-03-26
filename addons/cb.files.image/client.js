define([
    "views/image"
], function(FileImageView) {
    var _ = codebox.require("hr/utils");
    var files = codebox.require("core/files");

    var imageExts = [
        ".png", ".jpg", ".gif", ".tiff", ".jpeg", ".bmp", ".webp", ".svg"
    ];

    files.addHandler("imageviewer", {
        name: "Image Viewer",
        position: 1,
        View: FileImageView,
        valid: function(file) {
            return (!file.isDirectory() && _.contains(imageExts, file.extension()));
        }
    });
});