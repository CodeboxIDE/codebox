define([
    'hr/hr',
    'jQuery'
], function (hr, $) {
    return _.bindAll({
        /*
         *  Clear alerts
         */
        clear: function() {
            $(".cb-alerts").empty();
        },

        /*
         *  Show an alert
         *  @content: html content for the alert
         *  @duration: show duration
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
    }, 'show', 'clear');
});