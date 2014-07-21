var _ = require("lodash");
var pkgm = require("../packages").manager;

// List packages
var list = function(args) {
    return _.map(pkgm.orderedPackages(), function(pkg) {
        return pkg.infos();
    });
};

// Install packages
var install = function(args) {
    if (!args.url) throw "Need 'url'";

    return pkgm.installByUri(args.url).post("infos");
};

module.exports = {
    'list': list,
    'install': install
};
