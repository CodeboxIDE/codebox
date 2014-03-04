define([
    'hr/hr',
    'hr/dom',
    'hr/utils',
    'hr/promise',
    'core/user',
    'core/settings'
],function(hr, $, _, Q, user, settings) {
    var logging = hr.Logger.addNamespace("search");

    var Search = hr.Class.extend({
        defaults: {},

        // Constructor
        initialize: function(){
            Search.__super__.initialize.apply(this, arguments);

            // Search handlers
            this.handlers = {};

            // Settings
            this.settings = settings.add({
                'namespace': "search",
                'title': "Search",
                'fields': {}
            });

            return this;
        },

        /*
         *  Add a search handler
         *  @name: name for the search handler
         *  @getter: method which returns a promise with results
         */
        handler: function(infos, getter) {
            if (!infos.id || !infos.title) {
                throw new Error("Need 'id' and 'title' to define a search handler");
            }

            // Define handler
            this.handlers[infos.id] = _.defaults({
                'getter': getter
            }, infos, {});

            // Define settings
            this.settings.setField(infos.id, {
                'label': infos.title,
                'type': "checkbox",
                'default': true
            });

            logging.log("add search handler", infos.id);

            return this;
        },

        /*
         *  Search by query
         */
        query: function(query) {
            var d = Q.defer();
            var n = _.size(this.handlers), i = 0;

            _.each(this.handlers, function(handler, name) {
                if (!user.get("settings.search."+name, true)) return;

                var addResults = function(results) {
                    i = i + 1;
                    d.notify({
                        category: {
                            'title': handler.title
                        },
                        results: results, 
                        query: query
                    });
                    if (i == n) {
                        d.resolve(n);
                    }
                };

                var _d = handler.getter(query);

                if (_.isArray(_d)) {
                    addResults(_d);
                } else {
                    _d
                    .then(addResults, function(err) {
                        d.reject(err);
                    });
                }
            }, this);

            return d.promise;
        }
    });
    
    return (new Search());
});