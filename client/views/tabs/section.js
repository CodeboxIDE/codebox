define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "utils/dragdrop",
    "collections/tabs",
    "views/tabs/tab"
], function(_, $, hr, dnd, Tabs, TabHeaderItem) {
    var TabItem = hr.List.Item.extend({
        className: "component-tab-content",
        events: {
            "click": "click"
        },
        initialize: function() {
            TabItem.__super__.initialize.apply(this, arguments);
            this.$el.append(this.model.view.$el);
        },

        // Render active state
        render: function() {
            this.$el.toggleClass("active", this.model.isActive());
            return this.ready();
        },

        // Detatch the tab before removing this item
        remove: function() {
            this.model.view.detach();
            return TabItem.__super__.remove.apply(this, arguments);
        },

        // On click focus the tab
        click: function() {
            this.model.active();
        }
    });

    var TabsList = hr.List.extend({
        Collection: Tabs
    });


    var TabsSectionContent = TabsList.extend({
        className: "tabs-section-content",
        Item: TabItem,

    });

    var TabsSectionHeader = TabsList.extend({
        className: "tabs-section-header",
        Item: TabHeaderItem,
        events: {
            'dblclick': "openNewtab"
        },

        initialize: function() {
            TabsSectionHeader.__super__.initialize.apply(this, arguments);

            var that = this;

            // Drop tabs
            this.dropArea = new dnd.DropArea({
                view: this,
                dragType: this.parent.manager.drag,
                constrain: {
                    x: 20,
                    y: 20
                },
                handler: function(tab) {
                    tab.changeSection(that.parent.sectionId);
                }
            });

            return this;
        },

        openNewtab: function() {
            this.parent.manager.activeSection = this.parent.sectionId;
            this.parent.manager.openDefault();
        }
    });


    var TabsSectionView = hr.View.extend({
        className: "tabs-section",
        defaults: {

        },
        events: {
            
        },

        initialize: function() {
            TabsSectionView.__super__.initialize.apply(this, arguments);

            var that = this;
            this.manager = this.parent;
            this.sectionId = this.options.sectionId;

            this.tabs = new Tabs();
            this.tabs.sectionId = this.sectionId;

            this.header = new TabsSectionHeader({
                collection: this.tabs
            }, this);
            this.content = new TabsSectionContent({
                collection: this.tabs
            }, this);

            this.header.$el.appendTo(this.$el);
            this.content.$el.appendTo(this.$el);

            this.on("grid:layout", function() {
                this.tabs.each(function(tab) {
                    tab.view.trigger("tab:layout");
                });
            }, this);

            return this;
        },

        /*
         *  Add a tab to this section
         */
        addTab: function(tab, options) {
            tab.section = this.tabs;
            this.tabs.add(tab, options);
            return this;
        },

        /*
         *  Remove a tab from this section
         */
        removeTab: function(tab) {
            this.tabs.remove(tab);
            return this;
        },

        render: function() {
            return this.ready();
        }
    });

    return TabsSectionView;
});