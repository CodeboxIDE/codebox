define([
    "text!templates/image.html",
    "less!stylesheets/image.less"
], function(templateFile) {
    var _ = codebox.require("underscore");
    var $ = codebox.require("jQuery");
    var hr = codebox.require("hr/hr");
    var Dialogs = codebox.require("utils/dialogs");
    var FilesBaseView = codebox.require("views/files/base");

    var FileImageView = FilesBaseView.extend({
        className: "addon-files-imageviewer",
        templateLoader: "text",
        template: templateFile,
        events: {}
    });

    return FileImageView;
});