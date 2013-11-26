define([
    'collections/addons',
    'less!stylesheets/addons'
], function(Addons) {
    var hr = codebox.require("hr/hr");
    var _ = codebox.require("underscore");

    var AddonItem = hr.List.Item.extend({
        className: "addon-item",
        templateLoader: "addon.cb.manager.templates",
        template: "addon.html",
        events: {
            'click .action-install': 'install',
            'click .action-uninstall': 'uninstall'
        },

        install: function(e) {
            if (e) e.preventDefault();
            var btn = this.$(".action-install");
            btn.button('loading');
            this.model.install().then(_.bind(this.render, this)).fin(function() {
                btn.button('reset');
            });
        },
        uninstall: function(e) {
            if (e) e.preventDefault();
            var btn = this.$(".action-install");
            btn.button('loading');
            this.model.uninstall().then(_.bind(this.render, this)).fin(function() {
                btn.button('reset');
            });
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