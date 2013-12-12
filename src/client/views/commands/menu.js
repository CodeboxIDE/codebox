define([
    'underscore',
    'jQuery',
    'hr/hr',
    'collections/menu'
], function(_, $, hr, Menu) {

    var MenuItem = hr.List.Item.extend({
        tagName: "li",
        className: "menu-item",

        render: function() {
            var that = this;
            var itemType = this.model.get("type");
            var itemText = this.model.get("text");
            var itemAction = this.model.get("action");

            var $li = this.$el;

            if (itemType == "action") {
                var $a = $("<a>", {
                    'text': itemText,
                    'href': "#",
                    'click': function(e) {
                        e.preventDefault();
                        that.list.trigger("action", that.model);
                        itemAction(this.model);
                    }
                });
                $a.appendTo($li);
            } else if (itemType == "divider") {
                $li.addClass("divider");
            } else if (itemType == "menu") {
                $li.addClass("dropdown-submenu");
                var $a = $("<a>", {
                    'text': itemText,
                    'href': "#",
                    'tabindex': -1
                });
                $a.appendTo($li);

                var submenu = new MenuView();
                submenu.collection.add(that.model.get("items", []));
                submenu.on("action", function(subitem) {
                    this.trigger("action", that.model, subitem);
                }, that);
                submenu.$el.appendTo($li);
                submenu.render();
            }
        }
    });

    var MenuView = hr.List.extend({
        tagName: "ul",
        className: "dropdown-menu",
        Collection: Menu,
        Item: MenuItem,
    });

    return MenuView;
});