var _ = require("hr.utils");
var $ = require("jquery");
var View = require("hr.view");

var MenuView = View.extend({
    className: "component-menu",
    defaults: {},
    events: {},

    initialize: function() {
        MenuView.__super__.initialize.apply(this, arguments);
    },

    render: function() {
        this.$el.empty();

        var $menu = this.renderMenu(this.options.items || []);
        $menu.appendTo(this.$el);

        return this.ready();
    },

    renderMenu: function(items) {
        var $menu = $("<ul>", {
            'class': "menu"
        });

        var $items = _.map(items, this.renderItem, this);
        $menu.append($items);

        return $menu;
    },

    renderItem: function(item) {
        var that = this;

        item = _.defaults(item, {
            'type': "normal",
            'label': "",
            'click': function() { }
        });


        var $item = $("<li>", {
            'class': "menu-item type-"+item.type
        });
        var $label = $("<span>", {
            'class': 'item-label',
            'text': item.label,
            'click': function(e) {
                e.preventDefault();
                that.trigger("action");
                item.click();
            }
        });

        // Add label
        if (item.type != "divider") $label.appendTo($item);

        // Submenu
        if (item.type == "menu") {
            var $menu = this.renderMenu(item.items || []);
            $menu.appendTo($item);
        }

        return $item;
    }
});

module.exports = MenuView;
