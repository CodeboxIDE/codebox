define([
    'hr/hr',
    'jQuery',
    'core/api',
    'utils/dialogs',
], function(hr, $, api, dialogs) {
    var logging = hr.Logger.addNamespace("offline");

    var OfflineManager = hr.Class.extend({
        initialize: function() {
            var that = this;
            OfflineManager.__super__.initialize.apply(this, arguments);
            this.state = true;

            $(window).bind("online offline", function() {
                that.check();
            });
        },

        // Start management of offline mode
        start: function() {
            var onUpdateReady = function() {
                dialogs.alert("Application cache updated", "The offline application cache has been updated, This will refresh the IDE to use the new application cache.").fin(function() {
                    location.reload();
                });
            };
            
            window.applicationCache.addEventListener('updateready', onUpdateReady);
            if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
                onUpdateReady();
            }

            this.check();
        },

        // Set connexion status
        setState: function(state) {
            this.state = state;
            logging.log("state ", this.state);
            this.trigger("state", state);
        },

        // Check connexion status
        check: function() {
            var that = this;
            return api.rpc("/box/ping").then(function(data) {
                that.setState(data.ping == true);
                if (!that.state) {
                    return Q.reject(new Error("No connected"));
                }
            }, function() {
                that.setState(false);
            });
        }
    });


    return new OfflineManager();
});