var $ = require("jquery");
var _ = require("hr.utils");

var MenuView = require("../views/menu");
var taphold = require("./taphold");

var menu = {
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
    generateView: function(menuItems) {
        if (_.isFunction(menuItems)) menuItems = menuItems();

        var menuView = new MenuView({
            items: menuItems
        });
        menuView.$el.appendTo($("body"));
        menuView.on("action", function() {
            menu.clear();
        })
        menuView.render();
        return menuView;
    },

    /**
     *  Create a new context menu
     *
     * @param {array} menuItems
     * @param {object} pos position for the menu
     */
    open: function(menuItems, pos) {
        menu.clear();
        menu.lastTimeOpened = Date.now();

        var menuView = menu.generateView(menuItems);

        var w = menuView.$el.width();
        var h = menuView.$el.height();

        var windowW = $(window).width();
        var windowH = $(window).height();

        if ((pos.left+w) > windowW) {
            pos.left = pos.left - w;
            menuView.$el.addClass("submenus-right");
        }
        if ((pos.top+h) > windowH) {
            pos.top = pos.top - h;
            menuView.$el.addClass("submenus-top");
        }

        menuView.$el.css(_.extend({
            'position': "fixed",
            'z-index': 100
        }, pos));
        menuView.$el.attr("id", "ui-context-menu");
    },

    /**
     * Add a context menu to an element
     * the menu can be open by left click and tap hold on ipad
     *
     * @param {jqueryElement} el
     * @param {array} menu menu items
     * @param {object} options
     */
    add: function(el, menuView, options) {
        var $el = $(el);

        options = _.defaults({}, options, {
            // Menu accessible in textinput
            'textinput': false
        });

        var handler = function(e) {
            menu.origin = e.type;
            var target = e.target || e.srcElement;

            // Ignore Menu on textinput
            if (!options.textinput &&
            (target.tagName == 'INPUT' || target.tagName == 'SELECT' || target.tagName == 'TEXTAREA' || target.isContentEditable)) {
                return;
            }

            var x = e.pageX || e.originalEvent.touches[0].pageX;
            var y = e.pageY || e.originalEvent.touches[0].pageY;

            menu.open(menuView, {
                'left': x,
                'top': y
            });

            $el.addClass("ui-context-menu");
            return false;
        }

        $el.on("contextmenu", handler);
        if (navigator.userAgent.match(/iPad/i) != null) taphold.bind($el, handler);
    },

    remove: function(el) {
        var $el = $(el);

        $el.off("contextmenu");
        taphold.unbind($el);
    }
};

// Click on the page: clse context menu
$(document).on("click", function (e) {
    if (menu.lastTimeOpened > (Date.now() - 600) && menu.origin != "contextmenu") return;
    menu.clear();
});

// Open new Menu: close other context menu
$(document).on("contextmenu", function() {
    menu.clear();
});

module.exports = menu;
