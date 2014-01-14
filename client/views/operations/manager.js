define([
    "hr/hr",
    "models/operation",
    "collections/operations"
], function(hr, Operation, Operations) {

    var OperationItem = hr.List.Item.extend({
        className: "operation-item",
        template: "operations/operation.html",
        events: {
            "click": "open"
        },

        finish: function() {
            this.$el.toggle(this.model.get("state") == "running");
            return OperationItem.__super__.finish.apply(this, arguments);
        },

        open: function(e) {
            var panels = require("core/panels");
            panels.show();
        }
    });

    // Operations list
    var OperationsView = hr.List.extend({
        tagName: "ul",
        className: "cb-operations",
        Item: OperationItem,
        Collection: Operations,

        start: function() {
            return this.collection.start.apply(this.collection, arguments)
        }
    });

    return OperationsView;
});