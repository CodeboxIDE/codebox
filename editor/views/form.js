define([
    "hr/utils",
    "hr/dom",
    "hr/hr"
], function(_, $, hr) {

    var SchemaView = hr.View.extend({
        className: "form-schema",
        defaults: {
            prefix: "",
            schema: {},
            values: {}
        },
        events: {},

        initialize: function() {
            SchemaView.__super__.initialize.apply(this, arguments);
        },

        render: function() {
            var values = this.options.values;

            _.each(this.options.schema.properties, function(property, propertyName) {
                var $property = $("<div>", {
                    'class': "schema-property type-"+property.type
                });
                var $title = $("<label>", {
                    'class': "property-label",
                    'text': property.title || property.description
                });
                $title.appendTo($property);

                if (property.type == "object") {
                    var schema = new SchemaView({
                        'schema': property,
                        'values': values[propertyName] || {}
                    });
                    schema.$el.appendTo($property);
                    schema.update();
                }

                $property.appendTo(this.$el);
            }, this);


            return this.ready();
        }
    });

    var FormView = hr.View.extend({
        className: "component-form",
        defaults: {
            schema: {},
            values: {}
        },
        events: {},

        initialize: function() {
            FormView.__super__.initialize.apply(this, arguments);

            this.schema = new SchemaView({
                prefix: "",
                schema: this.options.schema,
                values: this.options.values
            });
            this.schema.update();
            this.schema.appendTo(this);
        }
    });

    return FormView;
});