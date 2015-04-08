var Q = require("q");
var _ = require("hr.utils");
var $ = require("jquery");
var View = require("hr.view");
var ListView = require("hr.list");
var Collection = require("hr.collection");

var string = require("../../utils/string");
var DialogInputView = require("./input");


var ListItem = ListView.Item.inherit(View.Template).extend({
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

var ListView = ListView.extend({
    Item: ListItem,
    className: "ui-content-list"
});

var DialogListView = DialogInputView.extend({
    defaults: {
        textIndex: function(model) { return JSON.stringify(model.toJSON()); }
    },
    className: "dialog-list",

    initialize: function() {
        DialogListView.__super__.initialize.apply(this, arguments);

        // Source for items
        this.results = new Collection();
        this.source = this.options.source;

        if (this.options.source instanceof Collection) {
            // Source is a collection
            this.results = new this.options.source.constructor()
            this.source = function(q) {
                return this.options.source.filter(function(model) {
                    return this.searchText(model, q);
                }, this);
            }.bind(this);
        }

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
            collection: this.results
        }, this);
        this.list.appendTo(this.$el);

        // Focus input
        this.listenTo(this.parent, "open", function() {
            this.$filterInput.focus();
            this.doSearch("");
            this.selectItem(0);
        });
    },

    render: function() {
        return this.ready();
    },

    searchText: function(model, q) {
        var t = this.options.textIndex(model);

        var words = q.split("")

        t = t.toLowerCase();
        q = q.toLowerCase();

        return _.every(q.split(" "), function(_q) {
            return t.search(_q) !== -1;
        });
    },

    doSearch: function(query) {
        var that = this, toRemove = [];
        if (this.list.collection.query == query) return;

        if (this.list.collection.query && query
        && query.indexOf(this.list.collection.query) == 0) {
            // Continue current search
            this.list.collection.query = query;
            this.list.collection.each(function(model) {
                if (!that.searchText(model, query)) {
                    toRemove.push(model);
                }
            });
            this.list.collection.remove(toRemove);
            //this.list.collection.sort();
            this.selectItem(this.getSelectedItem());
        } else {
            // Different search
            this.list.collection.query = query;
            this.list.collection.reset([]);

            Q()
            .then(function() {
                return that.source(query);
            })
            .then(function(result) {
                that.list.collection.add(_.filter(result, that.options.filter));
                that.selectItem(that.getSelectedItem());
            }, console.error.bind(console));
        }
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

        this.doSearch(q);

        if (this.keydownInterval) {
            clearInterval(this.keydownInterval);
            this.keydownInterval = null;
        }
    }
});

module.exports = DialogListView;
