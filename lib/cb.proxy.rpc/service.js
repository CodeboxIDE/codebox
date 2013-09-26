// Requires
var Q = require('q');
var _ = require('underscore');
var request = require('request');

function ProxyRPCService() {
    _.bindAll(this);
}



ProxyRPCService.prototype.requests = function(args, meta) {
	var deferred = Q.defer();

	var url = args.url;
	var method = args.method || "GET";
	var options = {
		"method": method,
		"uri": url,
		"body": meta.req.body
	};

	if (url == null) {
		deferred.reject(new Error("need 'url'"));
	} else {
		request(options, function (error, response, body) {
			deferred.resolve({
				"statusCode": response.statusCode,
				"body": response.body
			});
		});
	}

    return deferred.promise;
};

// Exports
exports.ProxyRPCService = ProxyRPCService;
