define([
    'collections/addons',
    'text!templates/addon.html',
    'less!stylesheets/addons'
], function(Addons, templateFile) {
    var hr = codebox.require("hr/hr");
    var _ = codebox.require("lodash");
    var addons = codebox.require("core/addons");

    // Collections of addons
    var managerAddons = new Addons();
    managerAddons.getIndex();

    var AddonItem = hr.List.Item.extend({
        className: "addon-item",
        templateLoader: "text",
        template: templateFile,
        events: {
            'click .action-install': 'install',
            'click .action-uninstall': 'uninstall'
        },

        templateContext: function() {
            return {
                'model': this.model,
                'addonStatus': addons.getState(this.model.get("name")),
                'isInstalled': addons.isInstalled(this.model.get("name")),
                'isDefault': addons.isDefault(this.model.get("name")),
                'isUpdated': addons.isUpdated(this.model)
            }
        },

        install: function(e) {
            if (e) e.preventDefault();
            var that = this;
            var btn = this.$(".action-install");
            btn.button('loading');
            addons.install(this.model.get("git")).then(_.bind(this.render, this)).fin(function() {
                btn.button('reset');
                that.update();
            });
        },
        uninstall: function(e) {
            if (e) e.preventDefault();
            var that = this;
            var btn = this.$(".action-install");
            btn.button('loading');
            addons.uninstall(this.model.get("name")).then(_.bind(this.render, this)).fin(function() {
                btn.button('reset');
                that.update();
            });
        }
    });

    var AddonsList = hr.List.extend({
        className: "addons-list",
        Collection: Addons,
        Item: AddonItem,
        defaults: _.defaults({
            'collection': managerAddons
        }, hr.List.prototype.defaults)
    });

    return AddonsList;
});