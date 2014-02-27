define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "models/command",

    "collections/tabs",

    "utils/dragdrop",
    "utils/keyboard",
    "utils/contextmenu",

    "views/tabs/tab",
    "views/tabs/base",
    "views/tabs/grid",
    "views/tabs/section"
], function(_, $, hr, Command, Tabs, DragDrop, Keyboard, ContextMenu, TabView, TabPanelView, GridView, TabsSectionView) {
    // Complete tabs system
    var TabsView = hr.View.extend({
        className: "cb-tabs",
        events: {
            
        },
        layouts: {
            "Auto Grid": 0,
            "Columns: 1": 1,
            "Columns: 2": 2,
            "Columns: 3": 3,
            "Columns: 4": 4
        },

        // Constructor
        initialize: function(options) {
            var that = this;
            TabsView.__super__.initialize.apply(this, arguments);

            // Sections
            this.sections = {};

            // Current layout
            this.layout = null; // null: mode auto
            this.grid = new GridView();
            this.grid.$el.appendTo(this.$el);

            // Commands
            this.layoutCommand = new Command({}, {
                'type': "menu",
                'title': "Layout"
            });
            _.each(this.layouts, function(layout, layoutName) {
                var command = new Command({}, {
                    'type': "action",
                    'title': layoutName,
                    'action': function() {
                        that.setLayout(layout);
                    }
                });
                this.layoutCommand.menu.add(command);
                this.on("layout", function(_layout) {
                    command.toggleFlag("active", layout == _layout);
                });
            }, this);

            // Tabs collection
            this.tabs = new Tabs();

            // Set base layout
            this.setLayout(null);
            return this;
        },

        // Return a section by its id
        getSection: function(id) {
            if (!this.sections[id]) {
                this.sections[id] = new TabsSectionView();
                this.sections[id].sectionId = id;
                this.grid.addView(this.sections[id]);
            }

            return this.sections[id];
        },

        // Remove a section
        removeSection: function(id) {
            var s = this.getSection(id);
            this.grid.removeView(s);
            delete this.sections[id];
            return this;
        },

        // Render all tabs
        render: function() {
            return this.ready();
        },

        /*
         *  Add a tab
         *  @V : view class
         *  @constructor : contructor options
         *  @options : options
         */
        add: function(V, construct, options) {
            var tab = null;

            options = _.defaults(options || {}, {
                // Don't trigger event
                silent: false,

                // Open after creation
                open: true,

                // Base title
                title: "untitled",

                // Unique id for this tab
                uniqueId: null,

                // Base section id
                section: 0
            });

            if (options.uniqueId) {
                tab = this.tabs.getById(options.uniqueId)
            } else {
                options.uniqueId = _.uniqueId("tab");
            }

            if (!tab) {
                // Create tab object
                tab = this.tabs.add({
                    'id': options.uniqueId,
                    'title': options.title
                });

                // Create content view
                tab.view = new V(_.extend(construct || {}, {
                    "tab": tab,
                }), this);

                // Add to section
                this.getSection(options.section).addTab(tab);
            }

            return tab.view;

            /*var tabid, tabinfos;
            options = _.defaults(options || {}, {
                silent: false,
                render: true,

                title: "untitled",      // Base title for the tab
                type: "default",
                uniqueId: null,         // Unique id for unicity of the tab
                close: true,            // Enable/disable close button
                open: true,             // Open after creation
                section: 0,             // Section to open in
                parentId: null          // Parent tabid
            });
            tabid = options.uniqueId != null ? this.checkTabExists(options.uniqueId) : null;
            if (tabid == null) {
                tabid = _.uniqueId("tab");
                tabinfos = {
                    "tabid": tabid,
                    "title": options.title,
                    "state": null,
                    "uniqueId": options.uniqueId,
                    "type": this.options.type,
                    "view": null,
                    "tab": null
                };
                this.tabs[tabid] = tabinfos;

                this.tabs[tabid].tab = new TabView({
                    "tabid": tabid,
                    "close": options.close,
                    "section": options.section
                }, this);

                this.tabs[tabid].view = new V(_.extend(construct || {}, {
                    "tabid": tabid,
                }), this);

                if (options.parentId != null) {
                    this.on("tab:"+options.parentId+":close", _.partial(this.tabs[tabid].tab.close, null, true), this.tabs[tabid].tab);
                }

                this.tabs[tabid].view.trigger("tab:ready");

                this.tabs[tabid].tab.update();
                this.tabs[tabid].view.update();

                this.addComponent("tabs_tabs", this.tabs[tabid].tab);
                this.addComponent("tabs_content", this.tabs[tabid].view);

                if (options.render) this.update();
            }
            if (this.activeTab == null || options.open) this.open(tabid);
            return this.tabs[tabid].view;*/
        },

        // Open a tab by tabid
        open: function(tabid) {
            
            return this;
        },

        // Close a tab by tabid
        close: function(tabid, force) {
            return Q();
        },

        // Open default new tab
        openDefaultNew: function(e) {
            this.trigger("tabs:opennew");
        },

        // Define tabs layout
        setLayout: function(l) {
            this.grid.setLayout(l);
            this.trigger("layout", l);
            this.update();
        }
    }, {
        Panel: TabPanelView
    });

    // Register as a template component
    hr.View.Template.registerComponent("component.tabs", TabsView);

    return TabsView;
});