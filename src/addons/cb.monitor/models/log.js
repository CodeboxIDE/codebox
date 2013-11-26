define([], function() {
    var hr = require("hr/hr");

    var Log = hr.Model.extend({
        defaults: {
            'section': null,
            'type': null,
            'content': []
        },

        // Return content as text
        contentText: function() {
            return _.map(this.get("content"), function(content) {
                if (_.isString(content)) {
                    return content;
                } else {
                    return JSON.stringify(content);
                }
            }).join(" ");
        }
    });

    return Log;
});