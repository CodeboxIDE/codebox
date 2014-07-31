define([
    "hr/utils",
    "hr/dom",
    "hr/hr"
], function(_, $, hr) {
    var FormView = hr.View.extend({
        className: "component-form",
        defaults: {
            schema: {},
            values: {}
        },
        events: {},

        initialize: function() {
            FormView.__super__.initialize.apply(this, arguments);
        }
    });

    return FormView;
});