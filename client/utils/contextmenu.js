define([
    'hr/dom',
    'hr/utils',
    'views/commands/menu'
], function ($, _, MenuView) {
    /**
     * Context menu manager
     *
     * @class
     */
    var ContextMenu = {
        lastTimeOpened: 0,
        origin: null,

        /**
         * Clear current context menu
         */
        clear: function() {
            $(".ui-context-menu").removeClass("ui-context-menu");
            $("#ui-context-menu").remove();
        },

        /**
         * Generate menu from menuItems or a generator function
         *
         * @param {array} menuItems
         */
        generateMenu: function(menuItems) {
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

        /**
         *  Create a new context menu
         *
         * @param {array} menuItems
         * @param {object} pos position for the menu
         */
        open: function(menuItems, pos) {
            ContextMenu.clear();
            ContextMenu.lastTimeOpened = Date.now();

            var menu = ContextMenu.generateMenu(menuItems);

            var w = menu.$el.width();
            var h = menu.$el.height();

            var windowW = $(window).width();
            var windowH = $(window).height();

            if ((pos.left+w) > windowW) {
                pos.left = pos.left - w;
                menu.$el.addClass("submenus-right");
            }
            if ((pos.top+h) > windowH) {
                pos.top = pos.top - h;
                menu.$el.addClass("submenus-top");
            }

            menu.$el.css(_.extend({
                'position': "fixed",
                'z-index': 100
            }, pos));
            menu.$el.attr("id", "ui-context-menu");
            menu.open();
        },

        /**
         * Add a context menu to an element
         * the menu can be open by left click and tap hold on ipad
         *
         * @param {jqueryElement} el
         * @param {array} menu menu items
         * @param {object} options
         */
        add: function(el, menu, options) {
            var $el = $(el);

            options = _.defaults({}, options, {
                // Menu accessible in textinput
                'textinput': false
            });

            var handler = function(e) {
                ContextMenu.origin = e.type;
                var target = e.target || e.srcElement;

                // Ignore contextmenu on textinput
                if (!options.textinput && 
                (target.tagName == 'INPUT' || target.tagName == 'SELECT' || target.tagName == 'TEXTAREA' || target.isContentEditable)) {
                    return;
                }
                
                var x = e.pageX || e.originalEvent.touches[0].pageX;
                var y = e.pageY || e.originalEvent.touches[0].pageY;

                ContextMenu.open(menu, {
                    'left': x,
                    'top': y
                });

                $el.addClass("ui-context-menu");
                return false;
            }

            $el.on("contextmenu", handler);
            if (navigator.userAgent.match(/iPad/i) != null) $el.taphold(handler);
        }
    };

    // Click on the page: clse context menu
    $(document).on("click", function (e) {
        if (ContextMenu.lastTimeOpened > (Date.now() - 600) && ContextMenu.origin != "contextmenu") return;
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