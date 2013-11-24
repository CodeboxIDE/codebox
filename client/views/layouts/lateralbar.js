define([
    "underscore",
    "jQuery",
    "hr/hr",
    "core/box",
    "core/commands",
    "core/files",
    "utils/dialogs",
    "views/searchbar",
    "views/commands",
    "views/files/tree",
], function(_, $, hr, box, commands, files, Dialogs) {

    var LateralBarView = hr.View.extend({
        className: "layout-lateralbar",
        template: "lateralbar.html",
        defaults: {},
        events: {
            "click .menu-action-search": "toggleSearch",
            "click .menu-action-open-root": "actionOpenRoot",
            "click .menu-action-open-terminal": "actionOpenTerminal"
        },

        // Constructor
        initialize: function(options) {
            LateralBarView.__super__.initialize.apply(this, arguments);
            var that = this;
            
            // Search command
            commands.register("search", {
                title: "Search",
                icon: "search",
                shortcuts: [
                    "s", "/"
                ],
                flags: "cb-active-mode-search"
            }, function() {
                that.toggleSearch();
            });

            // Files command
            commands.register("files.open", {
                title: "Files",
                icon: "folder-o",
                shortcuts: [
                    "f"
                ],
                flags: "cb-inactive-mode-body-fullpage"
            }, function(args) {
                /*args = _.defaults({}, args || {}, {
                    'path': "/"
                });
                files.open(args.path);*/
                that.toggleBar();
            });

            commands.register("files.new", {
                title: "New file",
                icon: "file-o",
                shortcuts: [
                    "mod+N"
                ]
            }, function(args) {
                files.openNew()
            });

            return this;
        },

        // Finish rendering
        finish: function() {
            this.$(".menu-bottom .menu-item a").tooltip({
                'placement': 'right',
                'delay': {
                    'show': 600,
                    'hide': 0
                }
            });

            // Search bar
            this.components.search.on("close", function() {
                this.toggleSearch(false);
            }, this);

            // Files (count .git files)
            this.components.files.on("count", function() {
                this.toggleBar(this.components.files.countFiles > 0);
            }, this);
            this.toggleBar(this.components.files.countFiles > 0);

            return LateralBarView.__super__.finish.apply(this, arguments);
        },

        // (action) Toggle search
        toggleSearch: function(st, query) {
            this.parent.toggleMode("search", st);

            st = this.parent.hasMode("search");
            if (!st) {
                query = "";
                this.components.search.clearResults();
            } else {
                this.components.search.focus();
            }
            if (query != null) this.$(".search-query").val(query);
        },

        // (action) Toggle lateral bar
        toggleBar: function(st) {
            if (st != null) st = !st;
            this.parent.toggleMode("body-fullpage", st);
        }
    });

    // Register as template component
    hr.View.Template.registerComponent("layout.lateralbar", LateralBarView);

    return LateralBarView;
});