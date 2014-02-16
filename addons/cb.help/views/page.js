define([
    "showdown",
    "extensions/github",
    "extensions/table",
    "less!stylesheets/page.less"
], function(Showdown) {
    var hr = codebox.require("hr/hr");
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var URL = codebox.require("utils/url");

    var PageView = hr.View.extend({
        className: "addon-help-page",
        events: {
            "click a": "clickLink"
        },

        // Constructor
        initialize: function() {
            PageView.__super__.initialize.apply(this, arguments);
            this.converter = new Showdown.converter({ extensions: ['github', 'table'] });

            this.content = "";
            this.loadPage(this.options.page);
            return this;
        },

        // Load page
        loadPage: function(page) {
            var that = this;

            this.currentPage = page || "README.md";
            return hr.Requests.get("/docs/"+this.currentPage).then(function(content) {
                that.content = content;
            }, function() {
                that.content = "# Error with page: "+_.escape(that.currentPage);
            }).fin(function() {
                that.render();
            });
        },

        // Render
        render: function() {
            this.$el.html(this.converter.makeHtml(this.content));
            return this.ready();
        },

        // Click link
        clickLink: function(e) {
            e.preventDefault();

            var $a = $(e.currentTarget);
            var url = $a.attr("href")
            var r = new RegExp('^(?:[a-z]+:)?//', 'i');
            if (!r.test(url)) {
                url = URL.absolutize(this.currentPage, url);
                this.loadPage(url);
            } else {
                window.open(url);
            }
        } 
    });

    return PageView;
});