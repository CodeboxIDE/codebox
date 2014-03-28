define([
    "settings",
    "views/tags"
], function(panelSettings, TagsView) {
    var PanelFileView = codebox.require("views/panels/file");

    var PanelOutlineView = PanelFileView.extend({
        className: "cb-panel-outline",
        FileView: TagsView
    });

    return PanelOutlineView;
});