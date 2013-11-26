define([
    "underscore",
    "jQuery",
    "hr/hr",
    "utils/dragdrop",
    "utils/keyboard",
    "utils/contextmenu",
    "views/tabs/tab",
    "views/tabs/base"
], function(_, $, hr, DragDrop, Keyboard, ContextMenu, TabView, TabPanelView) {
    // Complete tabs system
    var TabsView = hr.View.extend({
        className: "cb-tabs",
        events: {
            "dblclick .tabs-header": "openDefaultNew"
        },  

        // Constructor
        initialize: function(options) {
            TabsView.__super__.initialize.apply(this, arguments);

            this.layout = null; // null: mode auto

            this.tabs = {};
            this.activeTab = null;
            return this;
        },

        // Render all tabs
        render: function() {
            // Empty view
            this.empty();

            // Check tabs
            this.checkTabs();

            // Calcul number of sections
            var sections = this.getSections();
            var sections_n = _.max([1, _.size(sections)]);


            var layout = this.layout || Math.floor(Math.sqrt(sections_n)); // Number of columns

            var nColumns = Math.min(layout, sections_n);
            var nLines = Math.ceil(sections_n/layout);

            var sectionWidth = Math.floor(100/nColumns);
            var sectionHeight = Math.floor(100/nLines);

            var sectionLeft = 0;
            var sectionTop = 0;

            // Add different section
            _.each(sections, function(section, sectionIndex) {
                var section_el, section_tabs, section_tabs_content, css;

                section_el = $("<div>", {
                    "class": "section",
                    "css": {
                        "width": sectionWidth+"%",
                        "height": sectionHeight+"%",
                        "top": sectionTop+"%",
                        "left": sectionLeft+"%"
                    },
                }).appendTo(this.$el);
                section_el.on('dragleave', function(e) {
                    if (DragDrop.checkDrop(e, "tab")) {
                        section_el.removeClass("dragover");
                    }
                });
                section_el.on('dragover', function(e) {
                    if (DragDrop.checkDrop(e, "tab")) {
                        DragDrop.dragover(e, 'move');
                        section_el.addClass("dragover");
                    }
                });
                section_el.on('drop', _.bind(function(e) {
                    if (DragDrop.checkDrop(e, "tab")) {
                        section_el.removeClass("dragover");
                        DragDrop.drop(e);
                        this.tabs[DragDrop.getData(e, "tab")].tab.setSection(section);
                    }
                }, this));

                section_tabs = $("<div>", {
                    "class": "tabs-header"
                }).appendTo(section_el);

                section_tabs_content = $("<div>", {
                    "class": "tabs-content"
                }).appendTo(section_el);

                _.each(this.tabs, function(tab) {
                    if (tab.tab.section != section) return;

                    tab.tab.$el.appendTo(section_tabs);
                    tab.view.$el.appendTo(section_tabs_content);
                }, this);

                // Calcul next position
                sectionLeft = sectionLeft + sectionWidth;
                if (Math.ceil(sectionLeft/sectionWidth) >= nColumns) {
                    sectionLeft = 0;
                    sectionTop = sectionTop + sectionHeight;
                }
            }, this);
            this.delegateEvents();

            return this.ready();
        },

        /*
         *  Add a tab
         *  @V : view class
         *  @constructor : contructor options
         *  @options : options
         */
        add: function(V, construct, options) {
            var tabid, tabinfos;
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
            return this.tabs[tabid].view;
        },

        // Return list of differents sections names
        getSections: function() {
            return _.uniq(_.map(this.tabs, function(tab) {
                return tab.tab.section;
            }));
        },

        // Return list of tabs for a section
        getSectionTabs: function(section) {
            return _.filter(this.tabs, function(tab) {
                return tab.tab.section == section;
            });
        },

        // Return active tab for a section
        getActiveTab: function(section) {
            section = section || 0;
            return _.reduce(this.tabs, function(state, tab) {
                if (tab.tab.section != section) return state;
                if (tab.tab.isActive()) return tab;
                return state;
            }, null);
        },

        // Return current (last) active tab
        getCurrentTab: function() {
            if (this.activeTab == null || this.tabs[this.activeTab] == null) return null;
            return this.tabs[this.activeTab];
        },

        // Return active tab by type
        getActiveTabByType: function(type) {
            return _.reduce(this.tabs, function(state, tab) {
                if (tab.type != type) return state;
                if (tab.tab.isActive()) return tab;
                return state;
            }, null);
        },

        // Check if a tab with a uniqueid exists
        checkTabExists: function(uniqueId) {
            return _.reduce(this.tabs, function(state, tab) {
                return state || (uniqueId == tab.uniqueId ? tab.tabid : null);
            }, null)
        },

        // Check all tabs
        checkTabs: function() {
            var sections = this.getSections();
            _.each(sections, function(section) {
                var active = this.getActiveTab(section);
                if (active != null) return;
                this.getSectionTabs(section)[0].tab.open();
            }, this);
        },

        // Open a tab by tabid
        open: function(tabid) {
            var active ,section;
            this.activeTab = tabid;

            section = _.reduce(this.tabs, function(s, tab) {
                if (tab.tabid == tabid) {
                    return tab.tab.section;
                }
                return s;
            }, 0);

            _.each(this.tabs, function(tab) {
                if (tab.tab.section != section) return;
                active = (tab.tabid == this.activeTab);
                tab.tab.$el.toggleClass("active", active);
                tab.view.$el.toggleClass("active", active);
                tab.view.trigger("tab:state", active);
            }, this);

            this.checkTabs();
            return this;
        },

        // Close a tab by tabid
        close: function(tabid, force) {
            if (this.tabs[tabid] == null) return this;

            // Triger in tab
            this.tabs[tabid].view.trigger("tab:close");
            this.tabs[tabid].view.off();
            
            delete this.tabs[tabid].view;
            delete this.tabs[tabid];

            // Trigger global
            this.trigger("tab:"+tabid+":close");
            this.trigger("tabs:close", tabid);
            if (_.size(this.tabs) == 0) this.trigger("tabs:default");
            this.update();
            return this;
        },

        // Close others tabs
        closeOthers: function(tabid) {
            _.each(this.tabs, function(tab, oTabId) {
                if (oTabId == tabid) return;
                this.close(oTabId);
            }, this);

            return this;
        },

        // Open default new tab
        openDefaultNew: function(e) {
            this.trigger("tabs:opennew");
        },

        // Define tabs layout
        setLayout: function(l) {
            this.layout = l;
            this.update();
        }
    }, {
        Panel: TabPanelView
    });

    // Register as a template component
    hr.View.Template.registerComponent("component.tabs", TabsView);

    return TabsView;
});