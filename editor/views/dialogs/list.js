define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "views/dialogs/input"
], function(_, $, hr, DialogInputView) {
    var ListItem = hr.List.Item.extend({
        className: "list-item",

        initialize: function(options) {
            ListItem.__super__.initialize.apply(this, arguments);

            this.dialogContent = this.list.parent;
        },

        template: function() {
            return this.dialogContent.options.template;
        },
        templateContext: function() {
            return {
                item: this.model
            };
        }
    });

    var ListView = hr.List.extend({
        Item: ListItem,
        className: "ui-content-list"
    });

    var DialogListView = DialogInputView.extend({
        className: "",
        defaults: {},
        className: "dialog-list",

        initialize: function(options) {
            DialogListView.__super__.initialize.apply(this, arguments);

            // Filter for items
            this.$filterInput = $("<input>", {
                'type': "text"
            });
            this.$filterInput.appendTo(this.$el);

            // Items list
            this.list = new ListView({
                collection: this.options.collection
            }, this);
            this.list.appendTo(this.$el);

            // Focus input
            this.listenTo(this.parent, "open", function() {
                this.$filterInput.focus();
            });
        },

        render: function() {
            return this.ready();
        }
    });

    return DialogListView;
});