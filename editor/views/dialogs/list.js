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

        initialize: function() {
            DialogListView.__super__.initialize.apply(this, arguments);

            // Filter for items
            this.$filterInput = $("<input>", {
                'type': "text",
                'placeholder': this.options.placeholder
            });
            this.keydownInterval = null;
            this.$filterInput.on("keydown", this.onFilterKeydown.bind(this));
            this.$filterInput.on("keyup", this.onFilterKeyup.bind(this));
            this.$filterInput.appendTo(this.$el);

            // Items list
            this.list = new ListView({
                collection: this.options.collection
            }, this);
            this.list.appendTo(this.$el);

            // Focus input
            this.listenTo(this.parent, "open", function() {
                this.$filterInput.focus();
                this.filterBy("");
                this.selectItem(0);
            });
        },

        render: function() {
            return this.ready();
        },

        selectItem: function(i) {
            var i, boxH = this.list.$el.height();

            this.selected = i;

            if (this.selected >= this.list.collection.size()) this.selected = this.list.collection.size() - 1;
            if (this.selected < 0) this.selected = 0;

            i = 0;
            this.list.collection.each(function(model) {
                var y, h, item = this.list.items[model.id];
                item.$el.toggleClass("active", i == this.selected);

                if (i == this.selected) {
                    h = item.$el.outerHeight();
                    y = item.$el.position().top;

                    if (y > (boxH-(h/2))) {
                        this.list.$el.scrollTop((i+1)*h - boxH)
                    } else if (y <= (h/2)) {
                        this.list.$el.scrollTop((i)*h)
                    }
                }

                i = i + 1;
            }, this);
        },

        getSelectedItem: function() {
            var _ret = 0;
            this.list.collection.each(function(model, i) {
                var item = this.list.items[model.id];
                if (item.$el.hasClass("active")) {
                    _ret = i;
                    return false;
                }
            }, this);
            return _ret;
        },

        getValue: function() {
            return this.list.collection.at(this.getSelectedItem());
        },

        filterBy: function(q) {
            var that = this;

            this.list.filter(function(model, item) {
                if (!that.options.filter(model)) return false;

                var text = item.$el.text().toLowerCase();
                return text.search(q) !== -1;
            });
        },

        onFilterKeydown: function(e) {
            var key = e.which || e.keyCode;

            if (key == 38 || key == 40 || key == 13) {
                e.preventDefault();
            }

            var interval = function() {
                var selected = this.getSelectedItem();
                var pSelected = selected;

                if (key == 38) {
                    /* UP */
                    selected = selected - 1;
                } else if (key == 40) {
                    /* DOWN */
                    selected = selected + 1;
                }
                if (selected != pSelected) this.selectItem(selected);
            }.bind(this);

            if (this.keydownInterval) {
                clearInterval(this.keydownInterval);
                this.keydownInterval = null;
            }
            interval();
            this.keydownInterval = setInterval(interval, 600);
        },
        onFilterKeyup: function(e) {
            var q = this.$filterInput.val().toLowerCase();

            this.filterBy(q);

            if (this.keydownInterval) {
                clearInterval(this.keydownInterval);
                this.keydownInterval = null;
            }
        }
    });

    return DialogListView;
});