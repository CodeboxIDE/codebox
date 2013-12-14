define([
    'underscore',
    'jQuery',
    'hr/hr',
    'views/commands/manager'
], function(_, $, hr, CommandsView) {

    var MenuItem = hr.List.Item.extend({
        tagName: "li",
        className: "menu-item",

        // Constructor
        initialize: function() {
            MenuItem.__super__.initialize.apply(this, arguments);

            this._submenu = null;

            return this;
        },

        render: function() {
            var that = this;
            var itemType = this.model.get("type");
            var itemText = this.model.get("title");

            var $li = this.$el;
            $li.empty();

            if (itemType == "action") {
                var $a = $("<a>", {
                    'text': itemText,
                    'href': "#",
                    'click': function(e) {
                        e.preventDefault();
                        that.list.trigger("action", that.model);
                        that.model.run();
                    }
                });

                // Shortcut
                if (this.model.shortcutText()) {
                    $("<span>", {
                        'html': this.model.shortcutText(),
                        'class': "shortcut"
                    }).appendTo($a);
                }

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

                var submenu = that.submenu();
                submenu.on("action", function(subitem) {
                    this.trigger("action", that.model, subitem);
                }, that);
                submenu.$el.appendTo($li);
                submenu.render();
            }
            return this.ready();
        },

        // Return submenu
        submenu: function() {
            if (!this._submenu) {
                this._submenu = new MenuView({
                    'collection': this.model.menu
                });
            }
            return this._submenu;
        }
    });

    var MenuView = CommandsView.extend({
        tagName: "ul",
        className: "dropdown-menu ui-menu",
        Item: MenuItem,

        // Open the dropdown
        open: function() {
            this.$el.show();
        }
    });

    return MenuView;
});