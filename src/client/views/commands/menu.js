define([
    'underscore',
    'jQuery',
    'hr/hr',
    'views/commands/manager'
], function(_, $, hr, CommandsView) {

    var MenuItem = hr.List.Item.extend({
        tagName: "li",
        className: "menu-item",
        flagsClasses: {
            'active': "",
            'disabled': "disabled"
        },

        // Constructor
        initialize: function() {
            MenuItem.__super__.initialize.apply(this, arguments);

            this._submenu = null;

            return this;
        },

        buildAction: function(action) {
            var that = this;
            var itemIcon = this.model.get("iconMenu", "");

            var $a = $("<a>", {
                'text': this.model.get("title"),
                'href': "#",
                'click': function(e) {
                    e.preventDefault();
                    that.list.trigger("action", that.model);
                    if (action) {
                        action() 
                    } else {
                        that.model.run();
                    }
                }
            });

            // Shortcut
            if (this.model.label()) {
                $("<span>", {
                    'html': this.model.label(),
                    'class': "menu-label"
                }).appendTo($a);
            }

            // Active checkbox
            if (that.model.hasFlag("active")) {
                itemIcon = "check";
            }

            // Icon
            var $icon = $("<i>", {
                "class": "menu-icon fa fa-"+itemIcon
            }).prependTo($a);


            return $a;
        },

        render: function() {
            var that = this;
            var itemType = this.model.get("type");
            var itemText = this.model.get("title");

            var $li = this.$el;
            $li.empty();
            $li.attr("data-cmdid", this.model.id+"-"+this.model.cid);
            $li.attr("class", this.className+" "+(this.flagsClasses[this.model.get("flags", "")] || ""));

            if (itemType == "action") {
                var $a = this.buildAction();
                $a.appendTo($li);
            } else if (itemType == "checkbox") {
                var $a = this.buildAction(function() {
                    that.model.toggleFlag("active");
                    that.model.run(that.model.hasFlag("active"));
                });
                $a.appendTo($li);
            } else if (itemType == "divider") {
                $li.addClass("divider");
            } else if (itemType == "menu") {
                $li.addClass("dropdown-submenu");
                
                var $a = this.buildAction(function() {});
                $a.attr("tabindex", -1);
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