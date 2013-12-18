// Requires
var _ = require('underscore');
var loadfire = require('loadfire');

var urlparse = require('url').parse;

var startsWith = require('../utils').startsWith;


function createProxy(baseUrl) {
    var _config = {
        'resources': [
            {
                selector: loadfire.selectors.url(baseUrl),

                balancer: function(backends, req, next) {
                    var realUrl = decodeURIComponent(_.last(req.url.split('/')));
                    var parsed = urlparse(realUrl);

                    // Get options from "real url"
                    var url = parsed.path;
                    var port = (parsed.protocol == 'https:') ? 443 : 80;
                    var host = parsed.host;

                    // rewrite host, url
                    req.headers.host = host;
                    req.url = url;

                    // Destination
                    var dest = {
                        host: host,
                        port: port,
                        https: port == 443
                    };
                    console.log(dest);

                    return next(null, dest);
                },

                backends: [],
            }
        ],

        port: 8888,
    };

    // Validate and Resolve our configuration
    var config = loadfire.config.resolveConfig(_config);

    // Get the group balancer
    var gb = new loadfire.groupBalancer.GroupBalancer(config, config.resources)

    return gb;
}

// Exports
exports.createProxy = createProxy;
