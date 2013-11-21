define([
    'jQuery',
    'underscore'
], function ($, _) {
    /*
        Adding a contextmenu to a view

            ContextMenu.add(this.$el, [
                {
                    'type': "action",
                    'text': "Test 1",
                    'action': function() {
                        alert("test")
                    }
                }
            ]);
     */

    var ContextMenu = {
        /*
         * Clear context menus
         */
        clear: function() {
            $("#ui-context-menu").remove();
        },

        /*
         *  Create a new context menu
         */
        open: function(menuItems, pos) {
            ContextMenu.clear();

            var $menu = $("<ul>", {
                'id': "ui-context-menu",
                'class': "dropdown-menu",
                'css': _.extend({
                    'position': "fixed",
                    'z-index': 100
                }, pos)
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
                }

                $li.appendTo($subMenu);
            };

            addItems($menu, menuItems);
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
                return false;
            }

            $el.on("contextmenu", handler);
        }
    };

    $(document).click(function () {
        ContextMenu.clear();
    });
    $(document).on("contextmenu", function() {
        ContextMenu.clear();
    });

    $.fn.contextmenu = function (menu) {
        var $this = this;
        return (function () {
            ContextMenu.add($this, menu);
        })();
    };
    return ContextMenu;
});