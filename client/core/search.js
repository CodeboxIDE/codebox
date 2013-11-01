define([
    'hr/hr',
    'jQuery',
    'Underscore',
    'core/user',
    'utils/settings'
],function(hr, $, _, user, settings) {
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
                'section': "main",
                'title': "Search",
                'fields': {
                    
                }
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
        query: function(query, callback, context) {
            callback = _.bind(callback, context);

            _.each(this.handlers, function(handler, name) {
                if (!user.get("settings.search."+name, true)) {
                    return;
                }

                var addResults = function(results) {
                    callback({
                        'title': handler.title
                    }, results, query);
                };
                var d = handler.getter(query);

                if (_.isArray(d)) {
                    addResults(d);
                } else {
                    d.done(addResults);
                }
            }, this);
        }
    });
    
    return (new Search());
});