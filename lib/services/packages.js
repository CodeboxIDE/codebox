var _ = require("lodash");
var pkgm = require("../packages").manager;

// List packages
var list = function(args) {
    return _.map(pkgm.orderedPackages(), function(pkg) {
        return pkg.infos();
    });
};

module.exports = {
    'list': list
};
