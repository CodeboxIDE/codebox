define([
    "settings",
    "node_modules/markdown/lib/markdown",
    "text!templates/preview_markdown.html",
    "less!stylesheets/preview.less"
], function(settings, _markdown, templateFile) {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var box = codebox.require("core/box");
    var FilesTabView = codebox.require("views/files/tab");

    var markdown = window.markdown;

    var MarkdownView = FilesTabView.extend({
        className: "addon-files-previewviewer",
        templateLoader: "text",
        template: templateFile,
        events: {},

        initialize: function() {
            MarkdownView.__super__.initialize.apply(this, arguments);
            var that = this;

            // add refresh menu option
            this.tab.menu.menuSection([
                {
                    'type': "action",
                    'title': "Refresh",
                    'shortcuts': [
                        "mod+r"
                    ],
                    'bindKeyboard': true,
                    'action': function() {
                        that.refresh();
                    }
                }
            ]);

            this.model.on("file:change:update", function() {
                if (settings.user.get("refresh")) {
                    that.refresh();
                }
            }, this);

            this.refresh();
            return this;
        },

        refresh: function() {
            var that = this;
            this.model.download().then(function (content) {
                that.$el.html("<div class='markdown'>"+markdown.toHTML(content)+"</div>");
            });
        }
    });

    return MarkdownView;
});
