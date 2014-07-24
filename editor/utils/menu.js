define([
    'hr/dom',
    'hr/utils',
    'views/menu',
    'utils/taphold'
], function ($, _, MenuView, taphold) {


    /**
     * Context menu manager
     *
     * @class
     */
    var Menu = {
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

            var menu = new MenuView({
                items: menuItems
            });
            menu.$el.appendTo($("body"));
            menu.on("action", function() {
                Menu.clear();
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
            Menu.clear();
            Menu.lastTimeOpened = Date.now();

            var menu = Menu.generateMenu(menuItems);

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
                Menu.origin = e.type;
                var target = e.target || e.srcElement;

                // Ignore Menu on textinput
                if (!options.textinput &&
                (target.tagName == 'INPUT' || target.tagName == 'SELECT' || target.tagName == 'TEXTAREA' || target.isContentEditable)) {
                    return;
                }

                var x = e.pageX || e.originalEvent.touches[0].pageX;
                var y = e.pageY || e.originalEvent.touches[0].pageY;

                Menu.open(menu, {
                    'left': x,
                    'top': y
                });

                $el.addClass("ui-context-menu");
                return false;
            }

            $el.on("contextmenu", handler);
            if (navigator.userAgent.match(/iPad/i) != null) taphold.bind($elhandler);
        }
    };

    // Click on the page: clse context menu
    $(document).on("click", function (e) {
        if (Menu.lastTimeOpened > (Date.now() - 600) && Menu.origin != "contextmenu") return;
        Menu.clear();
    });

    // Open new Menu: close other context menu
    $(document).on("contextmenu", function() {
        Menu.clear();
    });

    return Menu;
});