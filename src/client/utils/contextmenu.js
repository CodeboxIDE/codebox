define([
    'jQuery',
    'underscore'
], function ($, _) {

    var ContextMenu = {
        /*
         * Clear context menus
         */
        clear: function() {
            $(".ui-context-menu").removeClass("ui-context-menu");
            $("#ui-context-menu").remove();
        },

        /*
         *  Generate menu
         */
        generateMenu: function(menuItems) {
            // Handle dynamic menu
            if (_.isFunction(menuItems)) menuItems = menuItems();

            var $menu = $("<ul>", {
                'class': "dropdown-menu"
            }).appendTo($("body"));

            var addItems = function($subMenu, items) {
                _.each(items, _.partial(addItem, $subMenu));
            };

            var addItem = function($subMenu, item) {
                var $li = $("<li>");

                if (item.type == "action") {
                    var $a = $("<a>", {
                        'text': item.text,
                        'href': "#",
                        'click': function(e) {
                            e.preventDefault();
                            ContextMenu.clear();
                            item.action(item);
                        }
                    });
                    $a.appendTo($li);
                } else if (item.type == "divider") {
                    $li.addClass("divider");
                } else if (item.type == "menu") {
                    $li.addClass("dropdown-submenu");
                    var $a = $("<a>", {
                        'text': item.text,
                        'href': "#",
                        'tabindex': -1
                    });
                    $a.appendTo($li);
                    var $submenu = ContextMenu.generateMenu(item.items);
                    $submenu.appendTo($li);
                }

                $li.appendTo($subMenu);
            };

            addItems($menu, menuItems);
            return $menu;
        },

        /*
         *  Create a new context menu
         */
        open: function(menuItems, pos) {
            ContextMenu.clear();

            var $menu = ContextMenu.generateMenu(menuItems);
            $menu.css(_.extend({
                'position': "fixed",
                'z-index': 100
            }, pos));
            $menu.attr("id", "ui-context-menu");
            $menu.show();
        },

        /*
         *  Add a context menu to an element
         *
         */
        add: function(el, menu, options) {
            var $el = $(el);

            options = _.defaults({}, options, {
                // Menu accessible in textinput
                'textinput': false
            });

            var handler = function(e) {
                var target = e.target || e.srcElement;

                // Ignore contextmenu on textinput
                if (!options.textinput && 
                (target.tagName == 'INPUT' || target.tagName == 'SELECT' || target.tagName == 'TEXTAREA' || target.isContentEditable)) {
                    return;
                }

                ContextMenu.open(menu, {
                    left: e.pageX,
                    top: e.pageY 
                });

                $el.addClass("ui-context-menu");
                return false;
            }

            $el.on("contextmenu", handler);
        }
    };

    // Click on the page: clse context menu
    $(document).click(function () {
        ContextMenu.clear();
    });

    // Open new contextmenu: close other context menu
    $(document).on("contextmenu", function() {
        ContextMenu.clear();
    });

    // jQuery plugin
    $.fn.contextmenu = function (menu) {
        var $this = this;
        return (function () {
            ContextMenu.add($this, menu);
        })();
    };
    return ContextMenu;
});