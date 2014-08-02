define([
    'hr/hr',
    'moment'
], function (hr, moment) {
    var relativeDate = function(d) {
        return moment(d).fromNow();
    };

    var date = {
        'relative': relativeDate
    };

    hr.Template.extendContext({
        '$date': date
    });

    return date;
});