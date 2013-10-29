define([
    'collections/addons',
    'less!stylesheets/addons'
], function(Addons) {
    var hr = require("hr/hr");
    var _ = require("Underscore");

    var AddonItem = hr.List.Item.extend({
        className: "addon-item",
        templateLoader: "addon.manager.templates",
        template: "addon.html",
        events: {
            'click .action-install': 'install',
            'click .action-uninstall': 'uninstall'
        },

        install: function(e) {
            if (e) e.preventDefault();
            this.model.install().done(_.bind(this.render, this));
        },
        uninstall: function(e) {
            if (e) e.preventDefault();
            this.model.uninstall().done(_.bind(this.render, this));
        } 
    });

    var AddonsList = hr.List.extend({
        className: "addons-list",
        Collection: Addons,
        Item: AddonItem,
        defaults: _.defaults({
            
        }, hr.List.prototype.defaults)
    });

    return AddonsList;
});