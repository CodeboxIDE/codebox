define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "models/command",
    "collections/commands",
    "utils/keyboard",
    "text!resources/templates/commands/palette/input.html",
    "text!resources/templates/commands/palette/command.html"
], function(_, $, hr, Command, Commands, keyboard,
templateFile, commandTemplateFile) {

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
            e.preventDefault();
        }
    });

    // Commands list
    var CommandsView = hr.List.extend({
        Item: CommandItem,
        Collection: Commands,
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
            //this.clearResults();
            this.doSearch("");

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
            if (this.query == query) return;
            console.log("do search", query);

            this.commands.collection.reset(Command.all.filter(function(command) {
                return command.get("search");
            }));
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
                //this.openResult(this.selected);
            }
            this.doSearch(q);
           // this.selectResult(this.selected);    
        },

        // (event) Mouse down
        mousedown: function(e) {
            e.stopPropagation();
        }
    });

    return PaletteView;
});