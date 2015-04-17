#! /usr/bin/env node

var _ = require("lodash");
var path = require("path");
var program = require('commander');

var pkg = require("../package.json");
var codebox = require("../lib");

program
.version(pkg.version)
.option('-r, --root [path]', 'Root folder to store packages')
.option('-p, --packages <items>', 'Comma separated list of packages to install', function (val) {
	return _.chain(val.split(","))
		.compact()
		.map(function(pkgref) {
			var parts = pkgref.split(":");
			var name = _.first(parts);
			var url = parts.slice(1).join(":");
			if (!name || !url) throw "Packages need to be formatted as name:url";

			return [name,url];
		})
		.object()
		.value()
}, [])
.parse(process.argv);

codebox.prepare({
	packages: {
		root: program.root,
		install: program.packages
	}
})
.then(function() {
	process.exit(0);
})
.fail(function(err) {
    console.log(err.stack || err.message || err);
});