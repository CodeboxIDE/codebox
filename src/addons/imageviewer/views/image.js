define([
    "less!stylesheets/image.less"
], function() {
    var _ = codebox.require("underscore");
    var $ = codebox.require("jQuery");
    var hr = codebox.require("hr/hr");
    var Dialogs = codebox.require("utils/dialogs");
    var FilesBaseView = codebox.require("views/files/base");

    var FileImageView = FilesBaseView.extend({
        className: "addon-files-imageviewer",
        templateLoader: "addon.imageviewer.templates",
        template: "image.html",
        events: {}
    });

    return FileImageView;
});