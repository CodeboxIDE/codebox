define([
    'hr/hr',
    'hr/dom'
], function (hr, $) {
    /**
     * Show alert messages in the top of the window
     *
     * @class
     */
    var alert = {
        /**
         * Clear all alerts
         */
        clear: function() {
            $(".cb-alerts").empty();
        },

        /**
         * Show an alert
         *
         * @param {string} content html content for the alert
         * @param {number} duration duration before the alert disapear
         */
        show: function(content, duration) {
            var that = this;
            duration = duration || 10000;

            this.clear();

            // Add the alert
            var $alert = $("<div>", {
                'class': "cb-alert",
                'html': content
            }).appendTo($(".cb-alerts"));

            // Timeout before removing the alert
            setTimeout(function() {
                that.clear();
            }, duration);
        }
    };

    return _.bindAll(alert);
});