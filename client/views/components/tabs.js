define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "utils/dragdrop"
], function(_, $, hr, DragDrop) {
    // Tab header
    var TabView = hr.View.extend({
        className: "component-tab",
        defaults: {
            title: "",
            tabid: "",
            close: true
        },
        events: {
            "click":        "open",
            "click .close": "close",
            "dblclick":     "createSection",
            "dragstart":    "dragStart"
        },

        // Constructor
        initialize: function() {
            TabView.__super__.initialize.apply(this, arguments);

            this.$el.attr("draggable", true);
            this.tabid = this.options.tabid;
            this.tabs = this.parent;
            this.section = this.options.section || 0;

            return this;
        },

        // Render the tab
        render: function() {
            this.$el.empty();

            var inner = $("<div>", {
                "class": "inner",
                "html": this.tabs.tabs[this.tabid].title
            }).appendTo(this.$el);

            if (this.options.close) {
                $("<a>", {
                    "class": "close",
                    "href": "#",
                    "html": "&times;"
                }).prependTo(inner);
            }
            return this.ready();
        },

        // Return true if is active
        isActive: function() {
            return this.$el.hasClass("active");
        },

        // Set section
        setSection: function(section) {
            this.section = section;
            this.open();
            this.tabs.render();
        },

        // Create section
        createSection: function(section) {
            this.setSection(_.uniqueId("section"));
        },

        // (event) open
        open: function(e) {
            if (e != null) e.preventDefault();
            this.tabs.open(this.tabid);
        },

        // (event) Drag start
        dragStart: function(e) {
            DragDrop.drag(e, "move");
            DragDrop.setData(e, "tab", this.tabid);
        },

        // (event) close
        close: function(e, force) {
            if (e != null) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.tabs.close(this.tabid, force);
        }
    });

    // Tab body view
    var TabPanelView = hr.View.extend({
        className: "component-tab-panel",

        // Constructor
        initialize: function() {
            TabPanelView.__super__.initialize.apply(this, arguments);
            this.tabid = this.options.tabid;
            this.tabs = this.parent;
            return this;
        },

        // Close the tab
        closeTab: function(e, force) {
            if (e != null) e.preventDefault();
            this.tabs.close(this.tabid, force);
        },

        // Set tab title
        setTabTitle: function(t) {
            this.tabs.tabs[this.tabid].title = t;
            this.tabs.tabs[this.tabid].tab.render();
            return this;
        },

        // Set tab title
        setTabId: function(t) {
            this.tabs.tabs[this.tabid].uniqueId = t;
            return this;
        },

        // Set tab type
        setTabType: function(t) {
            this.tabs.tabs[this.tabid].type = t;
            return this;
        },

        // Return if is active
        isActiveTab: function() {
            var active = this.tabs.getCurrentTab();
            return !(active == null || active.tabid != this.tabid);
        }
    });

    // Complete tabs system
    var TabsView = hr.View.extend({
        className: "component-tabs",

        // Constructor
        initialize: function(options) {
            TabsView.__super__.initialize.apply(this, arguments);
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
            var section_width = Math.floor(100/sections_n);


            // Add different section
            _.each(sections, function(section, sectionIndex) {
                var section_el, section_tabs, section_tabs_content, css;
                section_el = $("<div>", {
                    "class": "section",
                    "css": {
                        "width": section_width+"%",
                        "left": (sectionIndex*section_width)+"%"
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
            options= _.defaults(options || {}, {
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

                this.tabs[tabid].tab.render();
                this.tabs[tabid].view.render();

                this.addComponent("tabs_tabs", this.tabs[tabid].tab);
                this.addComponent("tabs_content", this.tabs[tabid].view);

                if (options.render) this.render();
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
            //if (_.size(this.tabs) <= 1) return this; 
            if (this.tabs[tabid] == null) return this;

            // Triger in tab
            this.tabs[tabid].view.trigger("tab:close");

            delete this.tabs[tabid].view;
            delete this.tabs[tabid];

            // Trigger global
            this.trigger("tab:"+tabid+":close");
            this.trigger("tabs:close", tabid);
            if (_.size(this.tabs) == 0) this.trigger("tabs:default");
            this.render();
            return this;
        },
    }, {
        Panel: TabPanelView
    });

    // Register as a template component
    hr.View.Template.registerComponent("component.tabs", TabsView);

    return TabsView;
});