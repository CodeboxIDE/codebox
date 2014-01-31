define([
    "views/tree"
], function(FilesTreeView) {
    var _ = codebox.require("lodash");
    var $ = codebox.require("jQuery");
    var hr = codebox.require("hr/hr");

    // Commands list
    var FilesListView = hr.List.extend({
        tagName: "ul",
        className: "cb-files-tree",
        
        Item: FilesTreeView.Item,
        defaults: _.extend({}, hr.List.prototype.defaults, {
            baseFilter: function(model) {
                return !model.isNewfile();
            }
        })
    });
    

    return FilesListView;
});