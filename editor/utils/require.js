var _ = require("hr.utils");
require("jquery");
require("hr.storage");
require("hr.view");
require("hr.class");
require("hr.model");
require("hr.collection");
require("hr.logger");

require('../**/*.js', {glob: true});

module.exports = function(m) {
    var r = _.reduce([
        m,
        "../"+m+".js"
    ], function(prev, _m) {
        try {
            return require(_m);
        } catch(e) {
            return prev;
        }
    }, undefined);
    if (!r) throw "Module not found '"+m+"'";
    return r;
};
