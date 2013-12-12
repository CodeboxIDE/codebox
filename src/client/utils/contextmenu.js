define([
    'jQuery',
    'underscore',
    'collections/menu',
    'views/commands/menu'
], function ($, _, Menu, MenuView) {

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

            var menu = new MenuView();
            menu.collection.add(menuItems);
            menu.$el.appendTo($("body"));
            menu.on("action", function() {
                ContextMenu.clear();
            })
            menu.render();
            return menu;
        },

        /*
         *  Create a new context menu
         */
        open: function(menuItems, pos) {
            ContextMenu.clear();

            var menu = ContextMenu.generateMenu(menuItems);
            menu.$el.css(_.extend({
                'position': "fixed",
                'z-index': 100
            }, pos));
            menu.$el.attr("id", "ui-context-menu");
            menu.$el.show();
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