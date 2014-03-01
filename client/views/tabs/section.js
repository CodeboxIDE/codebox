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
        render: function() {
            this.$el.toggleClass("active", this.model.isActive());
            return this.ready();
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
        Item: TabHeaderItem
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

            this.tabs = new Tabs();

            this.header = new TabsSectionHeader({
                collection: this.tabs
            });
            this.content = new TabsSectionContent({
                collection: this.tabs
            });

            this.header.$el.appendTo(this.$el);
            this.content.$el.appendTo(this.$el);

            var ignoreNextLeave = false;

            // Drop tabs
            this.dropArea = new dnd.DropArea({
                view: this,
                dragType: TabHeaderItem.drag,
                handler: function(tab) {
                    tab.changeSection(that.sectionId);
                }
            });

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
        addTab: function(tab) {
            tab.section = this.tabs;
            this.tabs.add(tab);
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