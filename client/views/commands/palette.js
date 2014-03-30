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
            if (!this.query) return CommandsWithQuery.__super__.comparator.apply(this, arguments);
            
            return -command.textScore(this.query);
        }
    });

    // View for a command in teh command palette
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

    // View for the list of comamdns in the command palette
    var CommandsView = hr.List.extend({
        Item: CommandItem,
        Collection: CommandsWithQuery,
        className: "palette-commands"
    });

    /**
     * Command palette view
     */
    var PaletteView = hr.View.extend({
        className: "cb-commands-palette close",
        template: templateFile,
        defaults: {},
        events: {
            "keydown input": "onKeydown",
            "keyup input": "onKeyup",
            "mousedown": "onMousedown"
        },

        initialize: function(options) {
            PaletteView.__super__.initialize.apply(this, arguments);

            /* Collection of commands currently in the command palette */
            this.commands = new CommandsView({}, this);

            /* Key navigation interval */
            this.keydownInterval = null;

            /* Document keydown binding for ESC */
            this._keydown = _.bind(function(e) {
                var key = e.which || e.keyCode;
                if (key == 27) {
                    this.close();
                }
            }, this);

            /* Document mousedown binding */
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

        /**
         * Open the command palette
         */
        open: function() {
            if (this.isOpen()) return;

            this.$el.removeClass("close");
            this.$("input").val("").focus();
            this.doSearch("");
            this.selectItem(0);

            $(document).bind("keydown", this._keydown);
            $(document).bind("mousedown", this._mousedown);
        },

        /**
         * Close the command palette
         */
        close: function() {
            if (!this.isOpen()) return;

            this.$el.addClass("close");
            this.$("input").blur();

            $(document).unbind("keydown", this._keydown);
            $(document).unbind("mousedown", this._mousedown);
        },

        /**
         * Toggle the command palette
         */
        toggle: function() {
            if (this.isOpen()) {
                this.close();
            } else {
                this.open();
            }
        },

        /**
         * Clear results
         */
        clearResults: function() {
            this.commands.collection.clear();
            return this;
        },

        /**
         * Do search
         *
         * @param {string} query
         */
        doSearch: function(query) {
            var that = this, toRemove = [];
            if (this.commands.collection.query == query) return;

            if (this.commands.collection.query && query
            && query.indexOf(this.commands.collection.query) == 0) {
                // Continue current search
                this.commands.collection.query = query;
                this.commands.collection.each(function(model) {
                    if (model.textScore(query) == 0) {
                        toRemove.push(model);
                    }
                });
                this.commands.collection.remove(toRemove);
                this.commands.collection.sort();
                this.selectItem(this.getSelectedItem());
            } else {
                // Different search
                this.commands.collection.query = query;
                this.commands.collection.reset([]);
                this.options.searchHandler(query)
                .then(function() {},
                function(err) {},
                function(result) {
                    that.commands.collection.add(_.filter(result.results, function(command) {
                        return !command.hasFlag("disabled");
                    }));
                    that.selectItem(that.getSelectedItem());
                });
            }
        },

        /**
         *  Select a specific item
         *
         * @param {number} i
         */
        selectItem: function(i) {
            var i, boxH = this.$(".results").height();

            this.selected = i;

            if (this.selected >= this.commands.collection.size()) this.selected = this.commands.collection.size() - 1;
            if (this.selected < 0) this.selected = 0;

            i = 0;
            this.commands.collection.each(function(model) {
                var y, h, item = this.commands.items[model.id];
                item.$el.toggleClass("selected", i == this.selected);

                if (i == this.selected) {
                    h = item.$el.outerHeight();
                    y = item.$el.position().top;

                    if (y > (boxH-(h/2))) {
                        this.$(".results").scrollTop((i+1)*h - boxH)
                    } else if (y <= (h/2)) {
                        this.$(".results").scrollTop((i)*h)
                    }
                }

                i = i + 1;
            }, this);
        },

        /**
         * Return index of the current selected item
         *
         * @return {number}
         */
        getSelectedItem: function() {
            var _ret = 0;
            this.commands.collection.each(function(model, i) {
                var item = this.commands.items[model.id];
                if (item.$el.hasClass("selected")) {
                    _ret = i;
                    return false;
                }
            }, this);
            return _ret;
        },

        /**
         *  Open current selected item or a specific one
         *
         * @param {number} i
         */
        openItem: function(i) {
            if (i == null) i = this.getSelectedItem();

            var item, model = this.commands.collection.at(i);
            if (!model) return false;

            item = this.commands.items[model.id];
            return item.run();
        },

        onKeydown: function(e) {
            var key = e.which || e.keyCode;

            if (key == 38 || key == 40 || key == 13) {
                e.preventDefault();
            }

            var interval = function() {
                var selected = this.getSelectedItem();
                var pSelected = selected;

                if (key == 38) {
                    /* UP */
                    selected = selected - 1;
                } else if (key == 40) {
                    /* DOWN */
                    selected = selected + 1;
                } 
                if (selected != pSelected) this.selectItem(selected);
            }.bind(this);

            if (this.keydownInterval) {
                clearInterval(this.keydownInterval);
                this.keydownInterval = null;
            }
            interval();
            this.keydownInterval = setInterval(interval, 600);
        },
        onKeyup: function(e) {
            var key = e.which || e.keyCode;
            var q = $(e.currentTarget).val();

            if (key == 27) {
                /* ESC */
                e.preventDefault();
                return;
            } else if (key == 13) {
                /* ENTER */
                e.preventDefault();
                this.openItem();
            }

            if (this.keydownInterval) {
                clearInterval(this.keydownInterval);
                this.keydownInterval = null;
            }

            this.doSearch(q);
        },
        onMousedown: function(e) {
            e.stopPropagation();
        }
    });

    return PaletteView;
});