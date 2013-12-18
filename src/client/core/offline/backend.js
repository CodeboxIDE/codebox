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
        '/box/status': {
            fallback: function() {
                return hr.Storage.get("box.status");
            },
            trigger: function(args, results) {
                hr.Storage.set("box.status", results);
            }
        }
    };
});