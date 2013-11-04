define([
    'hr/hr'
], function (hr) {
    return {
    	/*
         *  Parse query string
         */
        parseQueryString: function(){
            var assoc = {};
            var keyValues = location.search.slice(1).split('&');
            var decode = function(s){
                return decodeURIComponent(s.replace(/\+/g, ' '));
            };

            for (var i = 0; i < keyValues.length; ++i) {
                var key = keyValues[i].split('=');
                if (1 < key.length) {
                    assoc[decode(key[0])] = decode(key[1]);
                }
            }

            return assoc;
        },

        /*
         *  Parse an url in a dict with :
         *  'source', 'scheme', 'authority', 'userInfo', 'user', 'pass', 'host', 'port',
         *  'relative', 'path', 'directory', 'file', 'query', 'fragment'
         */
        parse: function(str, urlmode) {
            var query, key = ['source', 'scheme', 'authority', 'userInfo', 'user', 'pass', 'host', 'port',
                'relative', 'path', 'directory', 'file', 'query', 'fragment'],
            mode = urlmode || 'php',
            parser = {
                php: /^(?:([^:\/?#]+):)?(?:\/\/()(?:(?:()(?:([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?()(?:(()(?:(?:[^?#\/]*\/)*)()(?:[^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                loose: /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/\/?)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/ // Added one optional slash to post-scheme to catch file:/// (should restrict this)
            };

            var m = parser[mode].exec(str),
            uri = {},
            i = 14;
            while (i--) {
                if (m[i]) {
                    uri[key[i]] = m[i];
                }
            }
            if (mode !== 'php') {
                var name = 'queryKey';
                parser = /(?:^|&)([^&=]*)=?([^&]*)/g;
                uri[name] = {};
                query = uri[key[12]] || '';
                query.replace(parser, function ($0, $1, $2) {
                    if ($1) {uri[name][$1] = $2;}
                });
            }
            delete uri.source;
            return uri;
        }
    };
});