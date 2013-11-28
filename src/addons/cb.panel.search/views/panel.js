define([
    "less!stylesheets/panel.less"
], function() {
    var _ = codebox.require("underscore");
    var $ = codebox.require("jQuery");
    var hr = codebox.require("hr/hr");
    var search = codebox.require("core/search");
    var PanelBaseView = codebox.require("views/panels/base");

    var PanelSearchView = PanelBaseView.extend({
        className: "cb-panel-search",
        template: "panel.html",
        templateLoader: "addon.cb.panel.search.templates",
        events: {
            "click input": "focus",
            "blur input": "inputBlur",
            "focus input": "inputFocus",
            "keydown input": "keydown",
            "keyup input": "keyup",
            "click .result": "openResult"
        },

        initialize: function(options) {
            PanelSearchView.__super__.initialize.apply(this, arguments);

            this.openCallback = {};
            this.nResults = 0;
            this.selected = 0;
            this.query = "";

            // Bind events
            this.on("panel:open", function() {
                this.focus();
            }, this);
            this.on("panel:close", function() {
                this.blur();
            }, this);

            return this;
        },

        /* (event) Key input in search */
        keydown: function(e) {
            var key = e.which || e.keyCode;
            var q = $(e.currentTarget).val();

            if (key == 38 || key == 40 || key == 13) {
                e.preventDefault();
            }

            if (q.length == 0 && key == 8) {
                e.preventDefault();
                this.blur();
                this.clearResults();
                this.close();
            }
        },

        /* (event) Key input in search */
        keyup: function(e) {
            var key = e.which || e.keyCode;
            var q = $(e.currentTarget).val();

            if (key == 27) {
                /* ESC */
                e.preventDefault();
                this.blur();
                this.clearResults();
                this.close();
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
                this.openResult(this.selected);
            }
            this.doSearch(q);
            
            this.selectResult(this.selected);    
        },

        /* (event) Focus on search */
        focus: function(e) {
            if (e != null) e.preventDefault();
            this.$("input").focus();
            this.$("input").select();
        },

        /* (event) Blur search */
        blur: function(e) {
            if (e != null) e.preventDefault();
            this.$("input").blur();
        },

        /* Do search */
        doSearch: function(query) {
            query = query.toLowerCase();
            var $results = this.$(".results");
            
            if (query == this.query) return this;

            this.query = query;
            this.nResults = 0;
            this.clearResults();

            if (this.query.length == 0) return this;

            search.query(this.query, function(category, results, query) {
                if (this.query != query) return;

                var n = 0;
                var $cat = $("<ul>", {
                    "class": "cb-panel-list category"
                }).hide().appendTo($results);
                $("<li>", {
                    "text": category.title,
                    "class": "header"
                }).appendTo($cat);

                _.each(results, function(result) {
                    var li, i;
                    i = this.nResults;
                    this.nResults = this.nResults + 1;
                    n = n + 1;
                    li = $("<li>", {
                        "class": "result",
                        "data-result": i,
                        "text": result.text
                    }).appendTo($cat);

                    if (result.image != null) {
                        $("<img>", {
                            "src": result.image
                        }).prependTo(li)
                    }
                    $cat.show();

                    // Callback for click
                    if (result.callback != null) {
                        this.openCallback[i] = result.callback;
                    }

                    // Reselect result
                    this.selectResult(this.selected);
                }, this);
            }, this);
            return this;
        },

        /* Select a result */
        selectResult: function(i) {
            this.selected = i;
            if (this.selected < -1) this.selected = 0;
            if (this.selected >= this.nResults) this.selected = this.nResults - 1;

            this.$(".result").removeClass("selected");
            this.$(".result[data-result='"+this.selected+"']").addClass("selected");

            return this;
        },

        /* Clear results */
        clearResults: function() {
            this.$(".results").empty();
            this.openCallback = {};
            return this;
        },

        /* Open a result */
        openResult: function(i) {
            if (!_.isNumber(i)) {
                i = $(i.currentTarget).data("result");
            }
            if (i == -1) return this;
            if (this.openCallback[i] != null) this.openCallback[i]();
            return this;
        },

        /* Blur the input */
        inputBlur: function() {
            this.$el.toggleClass("mode-results", false);
        },

        /* Focus the input */
        focusBlur: function() {
            this.$el.toggleClass("mode-results", this.query.length > 0);
        }
    });

    return PanelSearchView;
});