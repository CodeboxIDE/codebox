define([
    'hr/hr',
    'q'
], function(hr, Q) {
    /*
     *  The offline backend is used as a backend for rpc api method
     *  The format is "method" -> manager
     *  Manager can contain:
     *      - fallback: method to call when offline
     *      - trigger: method called when online with the result (used to cache the result)
     */

    var cachedMethod = function(sId) {
        return {
            fallback: function() {
                return hr.Storage.get(sId);
            },
            trigger: function(args, results) {
                hr.Storage.set(sId, results);
            }
        };
    };

    return {
        // Ping
        '/box/ping': {
            fallback: function(args) {
                return {
                    'ping': false
                }
            }
        },

        // Box status
        '/box/status': cachedMethod("box.status"),

        // Auth join
        '/auth/join': cachedMethod("auth.join"),

        // Addons list
        '/addons/list': cachedMethod("addons.list"),

        // Users list
        // todo: limit the list to the single auth user
        '/users/list': cachedMethod("users.list")
    };
});