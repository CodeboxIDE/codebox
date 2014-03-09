define([
    'hr/utils',
    'hr/dom',
    'hr/hr',
    'views/commands/manager'
], function(_, $, hr, CommandsView) {

    var MenuItem = CommandsView.CommandItem.extend({
        tagName: "li",
        className: "menu-item",
        flagsClasses: {
            'active': "",
            'disabled': "disabled",
            "hidden": "hidden"
        },

        // Constructor
        initialize: function() {
            MenuItem.__super__.initialize.apply(this, arguments);

            // Submenu
            this._submenu = null;

            return this;
        },

        // Destructor
        remove: function() {
            if (this._submenu) this._submenu.remove();
            return MenuItem.__super__.remove.apply(this, arguments);
        },

        buildAction: function(action) {
            var that = this;
            var itemIcon = this.model.get("icons.menu", "");

            var $a = $("<a>", {
                'text': this.model.get("title"),
                'href': "#",
                'testId': this.model.id,
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

            // Running operation
            if (that.model.hasFlag("running")) {
                itemIcon = "refresh fa-spin";
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
            var itemIcon = this.model.get("icons.menu", "");

            var $li = this.$el;
            $li.empty();
            $li.attr("class", this.className+" "+this.getFlagsClass()+" menu-item-"+itemType);

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
            } else if (itemType == "label") {
                $li.addClass("dropdown-header");
                $li.text(itemText);

                // Icon
                if (itemIcon) {
                    $("<i>", {
                        "class": "menu-icon fa fa-"+itemIcon
                    }).prependTo($li);
                }
            } else if (itemType == "menu") {
                $li.addClass("dropdown-submenu");
                $li.one("mouseenter", function() {
                    var submenu = that.submenu();
                    
                    submenu.$el.appendTo(that.$el);
                    submenu.render();
                });
                
                var $a = this.buildAction(function() {});
                $a.attr("tabindex", -1);
                $a.appendTo($li);
            }
            return this.ready();
        },

        // Return submenu
        submenu: function() {
            if (!this._submenu) {
                this._submenu = new MenuView({
                    'collection': this.model.menu
                });
                this.listenTo(this._submenu, "action", function(subitem) {
                    this.trigger("action", this.model, subitem);
                });
            }
            return this._submenu;
        }
    });

    var MenuView = CommandsView.extend({
        tagName: "ul",
        className: "dropdown-menu ui-menu",
        Item: MenuItem,
        defaults: {
            displayEmptyList: false
        },

        // Open the dropdown
        open: function() {
            this.$el.show();
        }
    });

    return MenuView;
});