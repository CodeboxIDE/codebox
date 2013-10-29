define([
    "config",
    "models/addon"
], function(config, Addon) {
    var hr = require("hr/hr");
    var _ = require("Underscore");

    var decode_base64 = function(input) {
        var keyStr = "ABCDEFGHIJKLMNOP" +
           "QRSTUVWXYZabcdef" +
           "ghijklmnopqrstuv" +
           "wxyz0123456789+/" +
           "=";

        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        var base64test = /[^A-Za-z0-9\+\/\=]/g;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        do {
            enc1 = keyStr.indexOf(input.charAt(i++));
            enc2 = keyStr.indexOf(input.charAt(i++));
            enc3 = keyStr.indexOf(input.charAt(i++));
            enc4 = keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
               output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
               output = output + String.fromCharCode(chr3);
            }

            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";

        } while (i < input.length);

        return unescape(output);
    };

    var Addons = hr.Collection.extend({
        model: Addon,
        defaults: _.defaults({
            loader: "getFromIndex",
            loaderArgs: [],
            limit: 20
        }, hr.Collection.prototype.defaults),

        // Get index
        getIndex: function() {
            var that = this;

            this._index = hr.Cache.get("addons", "index");
            if (this._index) {
                return (new hr.Deferred()).resolve();
            }

            return hr.Requests.getJSON(config.indexUrl).then(function(index) {
                that._index = JSON.parse(decode_base64(index.content));
                hr.Cache.set("addons", "index", that._index, 60*60);
            });
        },
        
        // Addon from indexes
        getFromIndex: function(options) {
            var that = this;
            var d = new hr.Deferred();
            
            options = _.defaults(options || {}, {
                'start': 0,
                'limit': 20
            });

            var resolveWithIndex = function() {
                that.add({
                    'list': that._index.slice(options.start, options.start+options.limit),
                    'n': that._index.length
                });
                d.resolve();
            }

            if (this._index) {
                resolveWithIndex();
            } else {
                this.getIndex().then(resolveWithIndex, function() {
                    d.reject();
                });
            }

            return d;
        }
    });

    return Addons;
});