define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "collections/tabs"
], function(_, $, hr, Tabs) {
    var TabItem = hr.List.Item.extend({

    });
    var TabsList = hr.List.extend({
        Collection: Tabs,
        Item: TabItem
    });


    var TabsSectionContent = TabsList.extend({
        Item: TabItem
    });

    var TabsSectionHeader = TabsList.extend({
        Item: TabItem
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