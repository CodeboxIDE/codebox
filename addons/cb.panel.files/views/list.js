define([
    "views/tree"
], function(FilesTreeView) {
    var _ = codebox.require("underscore");
    var $ = codebox.require("jQuery");
    var hr = codebox.require("hr/hr");

    // Commands list
    var FilesListView = hr.List.extend({
        tagName: "ul",
        className: "cb-files-tree",
        
        Item: FilesTreeView.Item
    });
    

    return FilesListView;
});