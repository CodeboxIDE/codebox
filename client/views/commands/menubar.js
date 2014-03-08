define([
    "hr/hr",
    "views/commands/manager",
    "views/commands/menu"
], function(hr, CommandsView, MenuView) {
    var MenuCommandItem = CommandsView.CommandItem.extend({
        tagName: "div",
        className: "btn-group menu-command-item",
        events: {},

        // Render the menu item
        render: function() {
            var that = this;
            if (this.menu) this.menu.$el.detach();
            
            this.$el.empty();
            this.$el.attr("class", this.className+" "+this.getFlagsClass());

            var $btn = $("<button>", {
                'class': "btn dropdown-toggle",
                'text': this.model.get("title"),
                'data-toggle': "dropdown"
            }).appendTo(this.$el);

            $btn.on("click", function(e) {
                if (that.model.hasFlag("disabled")) {
                    e.stopPropagation();
                    e.preventDefault();
                    that.$el.removeClass("open");
                    return;
                }
            });

            $btn.one("click", function(e) {
                if (that.model.hasFlag("disabled")) return;

                if (!that.menu) {
                    that.menu = new MenuView({
                        'collection': that.model.menu
                    }, that);
                }
                that.menu.$el.appendTo(that.$el);
            });
            return this.ready();
        }
    });

    var MenubarView = CommandsView.extend({
        tagName: "div",
        className: "cb-commands-menubar",
        Item: MenuCommandItem,

        /*
         *  Register a new command
         *
         *  id: unique id for the command
         *  properties: properties to define the command
         *  handler: command handler
         */
        register: function(id, properties) {
            properties = _.extend({}, properties, {
                'type': "menu",
                'search': false,
                'id': id
            });

            var command = MenubarView.__super__.register.call(this, id, properties);

            return command;
        }
    });

    return MenubarView;
});