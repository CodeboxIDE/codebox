var _ = require('lodash');

var alias = {
    'PORT': 'CODEBOX_PORT'
}

var parseEnv = function (env, parent, prefix) {
    var k, v, envVar, parsedEnv;

    if (!parent) {
        parent = {};
    }

    for(k in parent) {
        v = parent[k];

        envVar = prefix? prefix + '_': '';
        envVar += k.toUpperCase();

        if (_.isObject(v) && !_.isArray(v) && !_.isFunction(v)) {
            parseEnv(env, v, envVar);
        }
        else {
            envVar = envVar.replace(/\./g, '__');
            if (envVar in env) {
                if (_.isArray(v) && (v.length == 0 || _.isString(v[0]))) {
                    parent[k] = _.compact(env[envVar].split(","));
                } else if (_.isNumber(v)) {
            		parent[k] = parseInt(env[envVar]);
            	} else if (_.isBoolean(v)) {
            		parent[k] = (env[envVar] == "false"? false : true);
            	} else {
            		parent[k] = env[envVar]
            	}
            }
        }
    }

    return parent;
};


// Extend configuration with environment variables
module.exports = function(options) {
    var env = _.clone(process.env);
    _.each(alias, function(to, from) {
        if (env[from]) env[to] = env[from] || env[to];
    });
    return parseEnv(env, options, 'CODEBOX');
};