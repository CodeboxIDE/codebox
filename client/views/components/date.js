define([
    "underscore",
    "hr/hr",
    "moment"
], function(_, hr, moment) {
    
    var DateView = hr.View.extend({
        tagName: "span",
        className: "component-date",
        defaults: {
            time: 0,
            update: 1000*60,
            updateD: 1.01,
            className: ""
        },

        initialize: function(options) {
            DateView.__super__.initialize.apply(this, arguments);
            this.$el.addClass(this.options.className);
            return this;
        },

        render: function() {
            if (this.interval != null) clearInterval(this.interval);
            this.interval = setInterval(_.bind(this.update, this), this.options.update); 
            this.options.update = this.options.update*this.options.updateD;
            this.$el.html(moment(this.options.time*1000).fromNow());
            return this.ready();
        },
    });
    hr.Template.registerComponent("components.date", DateView);

    return DateView;
});