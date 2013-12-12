define([
    "hr/hr",
    "views/commands/menu"
], function(hr, MenuView) {

    var MenuCommandItem = hr.List.Item.extend({
        tagName: "div",
        className: "btn-group menu-command-item",
        events: {},

        // Constructor
        initialize: function() {
            MenuCommandItem.__super__.initialize.apply(this, arguments);

            this.menu = new MenuView();
            return this;
        },

        // Render the menu item
        render: function() {
            $("<button>", {
                'class': "btn dropdown-toggle",
                'text': this.model.get("title"),
                'data-toggle': "dropdown"
            }).appendTo(this.$el);

            this.menu.collection.reset(this.model.menuItems());
            this.menu.$el.appendTo(this.$el);
            return this.ready();
        }
    });

    return MenuCommandItem;
});