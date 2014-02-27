define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "collections/tabs",
    "views/tabs/tab"
], function(_, $, hr, Tabs, TabHeaderItem) {
    var TabItem = hr.List.Item.extend({

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

            this.tabs = new Tabs();

            this.header = new TabsSectionHeader({
                collection: this.tabs
            });
            this.content = new TabsSectionContent({
                collection: this.tabs
            });

            this.header.$el.appendTo(this.$el);
            this.content.$el.appendTo(this.$el);

            return this;
        },

        /*
         *  Add a tab to this section
         */
        addTab: function(tab) {
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