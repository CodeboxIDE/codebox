var _ = require("hr.utils");
var $ = require("jquery");
var View = require("hr.view");
var Model = require("hr.model");

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
    }
};

var SchemaView = View.extend({
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
            // Value for this property
            var value = values[propertyName];

            // prefix for the property name (as array)
            var prefixs = _.compact(this.options.prefix.split(".").concat([propertyName]));

            // ignore array for the moment
            if (property.type == "array") return;

            var $property = $("<div>", {
                'class': "schema-property type-"+property.type
            });

            // Create label
            var $title = $("<label>", {
                'class': "property-label level-"+prefixs.length,
                'text': property.title || property.description,
                'css': {
                    'paddingLeft': prefixs.length*20
                }
            });
            $title.appendTo($property);

            // Handle subschema
            if (property.type == "object") {
                var schema = new SchemaView({
                    'schema': property,
                    'values': value || {},
                    'prefix': prefixs.join(".")
                });
                schema.$el.appendTo($property);
                schema.update();
            }
            else
            // Handle normal fields
            {
                var renderer = RENDERER[property.type];
                var $input = renderer(prefixs.join("."), property, value);
                $input.attr("data-getter", property.type);

                var $inputContainer = $("<div>", {
                    'class': "property-input"
                });

                $input.appendTo($inputContainer);
                $inputContainer.prependTo($property);
            }

            $property.appendTo(this.$el);
        }, this);


        return this.ready();
    }
});

var FormView = View.extend({
    className: "component-form",
    defaults: {
        schema: {},
        values: {}
    },

    initialize: function() {
        FormView.__super__.initialize.apply(this, arguments);

        this.schema = new SchemaView({
            prefix: "",
            schema: this.options.schema,
            values: this.options.values
        });
        this.schema.appendTo(this);
        this.schema.update();
    },

    // Extract all new values
    getValues: function() {
        var m = new Model({}, this.options.values);
        this.$("*[name]").each(function() {
            var name = $(this).attr("name");
            var getter = GETTER[$(this).data("getter")];
            var value = getter.apply($(this));

            m.set(name, value);
        });

        return m.toJSON();
    },

    // Update values in form
    setValues: function(values) {
        this.schema.options.values = values;
        return this.schema.update();
    }
});

module.exports = FormView;
