define([
    'jQuery'
], function ($) {
    return {
        show: function(p) {
            $(".cb-loading-alert").show();

            if (p) {
                p.fin(function() {
                    $(".cb-loading-alert").hide();
                });
            }
            
            return p;
        },
        stop: function() {
            $(".cb-loading-alert").hide();
        }
    };
});