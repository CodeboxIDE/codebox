define([
    'hr/hr',
    'hr/dom',
    'hr/utils',
    'hr/promise',
    'models/command',
    'core/user',
    'core/settings'
],function(hr, $, _, Q, Command, user, settings) {
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
         *  Normalize result
         */
        normResult: function(handler, result) {
            if (result instanceof Command) {
                return result;
            } else {
                return new Command({}, _.defaults(result, {
                    'category': handler.title
                }));
            }
        },

        /*
         *  Search by query
         */
        query: function(query) {
            var that = this;
            var errors = [];
            var d = Q.defer();
            var n = _.size(this.handlers), i = 0;

            _.each(this.handlers, function(handler, name) {
                var done = function(results) {
                    i = i + 1;
                    if (results) {
                        d.notify({
                            'category': {
                                'title': handler.title
                            },
                            'results': _.chain(results)
                                       .map(_.partial(that.normResult, handler))
                                       .value(), 
                            'query': query
                        });
                    }
                    if (i == n) {
                        if (errors.length == 0) {
                            d.resolve(n);
                        } else {
                            d.reject(errors);
                        }
                    }
                };

                if (!user.get("settings.search."+name, true)) return done();

                Q()
                .then(function() {
                    return handler.getter(query);
                })
                .then(done, function(err) {
                    errors.push(err);
                    return done();
                });
            });

            return d.promise;
        }
    });
    
    return (new Search());
});