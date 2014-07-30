define([
    "hr/hr"
], function(hr) {
    var StatusBar = hr.View.extend({

    });

    var status = new hr.Model();
    status.view = new StatusBar();

    return status;
});