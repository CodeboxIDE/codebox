define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "text!resources/templates/form.html"
], function(_, $, hr, formTemplate) {

    var GETTER = {
        'boolean': function() {
            return $(this).is(":checked");
        },
        'string': function() {
            return $(this).val();
        },
        'number': function() {
            return parseInt($(this).val());
        }
    };

    var RENDERER = {
        'boolean': function(propertyName, property, value) {
            return $("<input>", {
                'type': "checkbox",
                'checked': value === true,
                'name': propertyName
            });
        },

        'number': function(propertyName, property, value) {
            return $("<input>", {
                'type': "number",
                'value': value,
                'name': propertyName,
                'min': property.minimum,
                'max': property.maximum,
                'step': property.multipleOf || 1
            });
        },

        'string': function(propertyName, property, value) {
            if (property['enum']) return RENDERER.select.apply(this, arguments);

            return $("<input>", {
                'type': "text",
                'value': value,
                'name': propertyName
            });
        },

        'select': function(propertyName, property, value) {
            var $select = $("<select>", {
                'name': propertyName
            });

            $select.append(_.map(property['enum'], function(v) {
                return $("<option>", {
                    'selected': value == v,
                    'text': v,
                    'value': v
                });
            }));

            return $select;
        },

        'array': function() {
            return $("<button>", {
                "class": "button",
                "text": "Add"
            });
        }
    };

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
            this.$el.empty();

            _.each(this.options.schema.properties, function(property, propertyName) {
                var value = values[propertyName];
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
                        'values': value || {},
                        'prefix': propertyName
                    });
                    schema.$el.appendTo($property);
                    schema.update();
                } else {
                    var renderer = RENDERER[property.type];
                    var $input = renderer(_.compact([this.options.prefix, propertyName]).join("."), property, value);
                    $input.attr("data-getter", property.type);

                    $input.appendTo($property);

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
            values: {},
            submit: "Submit"
        },
        events: {
            "click .form-submit button": "onSubmit"
        },
        template: formTemplate,

        initialize: function() {
            FormView.__super__.initialize.apply(this, arguments);

            this.schema = new SchemaView({
                prefix: "",
                schema: this.options.schema,
                values: this.options.values
            });
            this.schema.update();
        },

        templateContext: function() {
            return {
                options: this.options
            };
        },

        render: function() {
            this.schema.detach();
            this.schema.update();

            return FormView.__super__.render.apply(this, arguments);
        },

        finish: function() {
            this.schema.$el.appendTo(this.$(".form-content"));

            return FormView.__super__.finish.apply(this, arguments);
        },

        // Extract all new values
        getValues: function() {
            var m = new hr.Model({}, this.options.values);
            this.$("*[name]").each(function() {
                var name = $(this).attr("name");
                var getter = GETTER[$(this).data("getter")];
                var value = getter.apply($(this));

                console.log("get", name, value);
                m.set(name, value);
            });

            return m.toJSON();
        },

        // On submit
        onSubmit: function(e) {
            this.trigger("submit", this.getValues());
        }
    });

    return FormView;
});