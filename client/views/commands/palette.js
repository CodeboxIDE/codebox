define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "text!resources/templates/commands/palette.html"
], function(_, $, hr, templateFile) {
    var PaletteView = hr.View.extend({
        className: "cb-commands-palette close",
        template: templateFile,
        templateLoader: "text",
        defaults: {
            
        },
        events: {
            "keydown input": "keydown",
            "keyup input": "keyup",
            "mousedown": "mousedown"
        },

        initialize: function(options) {
            PaletteView.__super__.initialize.apply(this, arguments);

            this.selected = 0;
            this.query = "";

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

        // Check if is open
        isOpen: function() {
            return !this.$el.hasClass("close");
        },

        // Open the command palette
        open: function() {
            if (this.isOpen()) return;

            this.$el.removeClass("close");
            this.$("input").focus();

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
            this.$(".results").empty();
            this.resultsCallback = {};
            return this;
        },

        // Do search
        doSearch: function(query) {
            if (this.query == query) return;
            console.log("do search", query);

            var that = this, $results = this.$(".results");

            this.query = query;
            this.nResults = 0;
            this.clearResults();

            this.options.searchHandler(this.query)
            .then(function() {
                console.log("search done");
            },
            function(err) {
                console.log("search error", err);
            },
            function(result) {
                console.log("result", result);
                if (that.query != result.query) return;

                var n = 0;
                var $cat = $("<ul>", {
                    "class": "results-category"
                }).hide().appendTo($results);
                $("<li>", {
                    "text": result.category.title,
                    "class": "header"
                }).appendTo($cat);

                _.each(result.results, function(_result) {
                    var li, i;
                    i = that.nResults;
                    that.nResults = that.nResults + 1;
                    n = n + 1;
                    li = $("<li>", {
                        "class": "result",
                        "data-result": i,
                        "text": _result.text,
                        "hover": function() {
                            //that.selectResult(i);
                        }
                    }).appendTo($cat);

                    $cat.show();

                    // Callback for click
                    if (_result.callback != null) {
                        that.openCallback[i] = _result.callback;
                    }

                    // Reselect result
                    //this.selectResult(this.selected);
                });
            }, this);
        },

        // (event) Key input in search
        keydown: function(e) {
           /* var key = e.which || e.keyCode;
            var q = $(e.currentTarget).val();

            if (key == 38 || key == 40 || key == 13) {
                e.preventDefault();
            }

            if (q.length == 0 && key == 8) {
                e.preventDefault();
                this.blur();
                this.clearResults();
                this.close();
            }*/
        },

        // (event) Key input in search
        keyup: function(e) {
            var key = e.which || e.keyCode;
            var q = $(e.currentTarget).val();

            if (key == 27) {
                /* ESC */
                e.preventDefault();
                /*this.blur();
                this.clearResults();
                this.close();*/
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
            
            //this.selectResult(this.selected);    
        },

        // (event) Mouse down
        mousedown: function(e) {
            e.stopPropagation();
        }
    });

    return PaletteView;
});