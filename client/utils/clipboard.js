define([
    'hr/hr',
    'hr/utils'
], function (hr, _) {
    var CONVERTERS = {
        // from -> to
        'file': {
            // File are already representated as a string (equals path)
            'string': function(file) {
                return file;
            }
        }
    };

    /**
     * Virtual clipboard manager
     *
     * @class
     * @constructor
     */
    var Clipboard = hr.Class.extend({
        initialize: function() {
            this.data = null;
            return this;
        },

        /**
         * Check if has some data available and type is valid
         *
         * @param {string} type
         */
        hasData: function(type) {
            if (!this.data) return false;
            return !this.type || this.type == this.data.type;
        },

        /**
         * Set data in virtual clipboard
         *
         * @param {string} type
         * @param {object} value
         * @param {object} options
         */
        setData: function(type, value, options) {
            this.data = {
                'type': type,
                'value': value,
                'options': options || {}
            };
            this.trigger("data", this.data);
        },

        /**
         *  Clear clipboard
         */
        clear: function() {
            this.data = null;
            this.trigger("data", this.data);
        },

        /**
         *  Get raw data
         */
        getRaw: function() {
            return this.data;
        },

        /**
         *  Get data from clipboard and convert to the right type
         *
         * @param {string} type
         */
        getData: function(type) {
            // No data
            if (!this.data) return null;

            // Correct type
            if (this.data.type == type) return this.data.value;

            // Try converting
            if (!CONVERTERS[this.data.type] && !CONVERTERS[this.data.type][type]) {
                throw new Error("No converters from "+this.data.type+" to "+type);
            } else {
                return CONVERTERS[this.data.type][type](this.data.value);
            }

        }
    });
    return new Clipboard();
});