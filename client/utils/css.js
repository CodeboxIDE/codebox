define([
    "hr/utils"
], function(_) {
    /**
     * Utils for managing css and styling
     *
     * @class
     */
    var css = {
        /**
         * Convert a json formatted data to some css
         *
         * @param {object} css css json-formatted
         * @param {object} options options for convertion
         */
        convertJSON: function(css, options) {
            var nodes = [];
            options = _.defaults(options || {}, {
                'base': "",
                'namespace': {},
                'joint': "\n"
            });

            var convertNode = function(node, base) {
                return _.map(node, function(value, property) {
                    var result = "", children = "", selector, attr= "";

                    // Property
                    if (_.isString(value)) {
                        return property + ": " + value + ";"
                    }

                    // Sub element
                    if (property[0] == '&') {
                        selector = base;
                        attr = property;
                    } else {
                        selector = base ? base+" "+property : property;
                    }
                    nodes.push({
                        'selector': selector,
                        'attr': attr,
                        'content': convertNode(value, selector)
                    });

                    return "";
                }).join(options.joint);
            };

            convertNode(css);

            // Convert nodes list to text
            return _.map(nodes, function(node) {
                var selector = options.base + " " + (options.namespace[node.selector] || node.selector);
                selector = selector + node.attr.replace("&", "");
                return selector+" {"+options.joint+node.content+options.joint+"}";
            }).join(options.joint);
        }
    }

    return _.bindAll(css);
});