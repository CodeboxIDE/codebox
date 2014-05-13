define([
    "text!templates/preview.html",
    "less!stylesheets/preview.less"
], function(templateFile) {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var hr = codebox.require("hr/hr");
    var Dialogs = codebox.require("utils/dialogs");
    var FilesBaseView = codebox.require("views/files/base");

    var PreviewView = FilesBaseView.extend({
        className: "addon-files-previewviewer",
        templateLoader: "text",
        template: templateFile,
        events: {}
    });

    return PreviewView;
});