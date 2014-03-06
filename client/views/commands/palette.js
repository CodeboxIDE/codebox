define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "models/command",
    "collections/commands",
    "utils/keyboard",
    "utils/string",
    "text!resources/templates/commands/palette/input.html",
    "text!resources/templates/commands/palette/command.html"
], function(_, $, hr, Command, Commands, keyboard, string,
templateFile, commandTemplateFile) {

    // Collection for comparing command with a query string
    var CommandsWithQuery = Commands.extend({
        // Sort comparator
        comparator: function(command) {
            if (!this.query) return CommandsWithQuery.__super__.initialize.apply(this, arguments);
            
            return -command.textScore(this.query);
        }
    });

    // View for one command result
    var CommandItem = hr.List.Item.extend({
        className: "command",
        template: commandTemplateFile,
        events: {
            'click': "run"
        },

        templateContext: function() {
            return {
                'command': this.model
            };
        },

        run: function(e) {
            if (e) e.preventDefault();

            // Run the command
            this.model.run();

            // Close the palette
            this.list.parent.close();
        }
    });

    // Commands list
    var CommandsView = hr.List.extend({
        Item: CommandItem,
        Collection: CommandsWithQuery,
        className: "palette-commands"
    });

    var PaletteView = hr.View.extend({
        className: "cb-commands-palette close",
        template: templateFile,
        defaults: {},
        events: {
            "keyup input": "keyup",
            "mousedown": "mousedown"
        },

        initialize: function(options) {
            PaletteView.__super__.initialize.apply(this, arguments);

            this.commands = new CommandsView({}, this);
            this.selected = 0;

            this._keydown = _.bind(function(e) {
                var key = e.which || e.keyCode;
                if (key == 27) {
                    this.close();
                }
            }, this);

            this._mousedown = _.bind(function(e) {
                this.close();
            }, this);

            return this;
        },

        finish: function() {
            this.commands.appendTo(this.$(".results"));
            return PaletteView.__super__.finish.apply(this, arguments);
        },

        // Check if is open
        isOpen: function() {
            return !this.$el.hasClass("close");
        },

        // Open the command palette
        open: function() {
            if (this.isOpen()) return;

            this.$el.removeClass("close");
            this.$("input").val("").focus();
            this.doSearch("");
            this.selectItem(0);

            $(document).bind("keydown", this._keydown);
            $(document).bind("mousedown", this._mousedown);
        },

        // Close the command palette
        close: function() {
            if (!this.isOpen()) return;

            this.$el.addClass("close");
            this.$("input").blur();

            $(document).unbind("keydown", this._keydown);
            $(document).unbind("mousedown", this._mousedown);
        },

        // Toggle the command palette
        toggle: function() {
            if (this.isOpen()) {
                this.close();
            } else {
                this.open();
            }
        },

        // Clear results
        clearResults: function() {
            this.commands.collection.clear();
            return this;
        },

        // Do search
        doSearch: function(query) {
            var that = this;
            if (this.commands.collection.query == query) return;

            this.commands.collection.query = query;
            this.commands.collection.reset([]);
            this.options.searchHandler(this.query)
            .then(function() {
                console.log("search done");
            },
            function(err) {
                console.log("search error", err);
            },
            function(result) {
                that.commands.collection.add(result.results);
            });

            /*this.commands.collection.reset(Command.all.filter(function(command) {
                return command.get("search");
            }));*/
            this.selectItem(this.selected);
        },

        // (event) Key input in search
        keyup: function(e) {
            var key = e.which || e.keyCode;
            var q = $(e.currentTarget).val();

            if (key == 27) {
                /* ESC */
                e.preventDefault();
                return;
            } else if (key == 38) {
                /* UP */
                this.selected = this.selected - 1;
            } else if (key == 40) {
                /* DOWN */
                this.selected = this.selected + 1;
            } else if (key == 13) {
                /* ENTER */
                e.preventDefault();
                this.openItem(this.selected);
            }
            this.doSearch(q);
            this.selectItem(this.selected);
        },

        selectItem: function(i) {
            var boxH = this.$(".results").height();

            this.selected = i;

            if (this.selected >= this.commands.collection.size()) this.selected = this.commands.collection.size() - 1;
            if (this.selected < 0) this.selected = 0;

            this.commands.collection.each(function(model, i) {
                var y, h, item = this.commands.items[model.id];
                item.$el.toggleClass("selected", i == this.selected);

                if (i == this.selected) {
                    h = item.$el.outerHeight();
                    y = item.$el.position().top;

                    if (y > (boxH-(h/2)) || y < 0) {
                        this.$(".results").scrollTop((i+1)*h - boxH)
                    }
                }

            }, this);
        },

        openItem: function(i) {
            var item, model = this.commands.collection.at(i);
            if (!model) return false;
            item = this.commands.items[model.id];
            return item.run();
        },

        // (event) Mouse down
        mousedown: function(e) {
            e.stopPropagation();
        }
    });

    return PaletteView;
});