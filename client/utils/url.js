define([
    'hr/hr'
], function (hr) {


    return URL = {
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
        parse: function(url) {
            var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
            // authority = '//' + user + ':' + pass '@' + hostname + ':' port
            return (m ? {
                href     : m[0] || '',
                protocol : m[1] || '',
                authority: m[2] || '',
                host     : m[3] || '',
                hostname : m[4] || '',
                port     : m[5] || '',
                pathname : m[6] || '',
                search   : m[7] || '',
                hash     : m[8] || ''
            } : null);
        },

        absolutize: function (base, href) {
            function removeDotSegments(input) {
                var output = [];
                input.replace(/^(\.\.?(\/|$))+/, '')
                 .replace(/\/(\.(\/|$))+/g, '/')
                 .replace(/\/\.\.$/, '/../')
                 .replace(/\/?[^\/]*/g, function (p) {
                    if (p === '/..') {
                        output.pop();
                    } else {
                        output.push(p);
                    }
                });
                return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
            }

            href = URL.parse(href || '');
            base = URL.parse(base || '');

            return !href || !base ? null : (href.protocol || base.protocol) +
                (href.protocol || href.authority ? href.authority : base.authority) +
                removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
                (href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
                href.hash;
        }
    };
});