define([
    "settings",
    "text!templates/preview_html.html",
    "less!stylesheets/preview.less"
], function(settings, templateFile) {
    var _ = codebox.require("hr/utils");
    var $ = codebox.require("hr/dom");
    var box = codebox.require("core/box");
    var FilesTabView = codebox.require("views/files/tab");

    var PreviewView = FilesTabView.extend({
        className: "addon-files-previewviewer",
        templateLoader: "text",
        template: templateFile,
        events: {},
        
        initialize: function() {
            PreviewView.__super__.initialize.apply(this, arguments);
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
            
            // bind save event 
            box.on("box:watch:change:update", function() {
                if (settings.user.get("refresh")) {
                    that.refresh();
                }
            }, this);
            
            return this;
        },
        
        refresh: function() {
            $(this.$el).find("iframe").attr('src', function ( i, val ) { return val; });
        }
    });

    return PreviewView;
});
