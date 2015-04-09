var _ = require("hr.utils");
var Model = require("hr.model");

var _getDefaults = function(schema) {
    if (typeof schema['default'] !== 'undefined') {
        return schema['default'];
    } else if (schema.type === 'object') {
        if (!schema.properties) { return {}; }

        for (var key in schema.properties) {
            if (schema.properties.hasOwnProperty(key)) {
                schema.properties[key] = _getDefaults(schema.properties[key]);

                if (typeof schema.properties[key] === 'undefined') {
                    delete schema.properties[key];
                }
            }
        }

        return schema.properties;
    } else if (schema.type === 'array') {
        if (!schema.items) { return []; }
        return [_getDefaults(schema.items)];
    }
};

var Schema = Model.extend({
    defaults: {
        id: null,
        schema: {}
    },

    initialize: function() {
        Schema.__super__.initialize.apply(this, arguments);

        this.data = new Model();
    },

    getDefaults: function(schema) {
        return _getDefaults(this.toJSON().schema || {});
    },

    getData: function() {
        return _.extend({}, this.getDefaults(), this.data.toJSON());
    }
});

module.exports = Schema;
