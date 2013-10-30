define([
    'hr/hr',
    'jQuery',
    'Underscore'
],function(hr, $, _) {
    var logging = hr.Logger.addNamespace("search");

    var Search = hr.Class.extend({
        defaults: {
            
        },

        // Constructor
        initialize: function(){
            Search.__super__.initialize.apply(this, arguments);
            this.handlers = {};
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
            this.handlers[infos.id] = _.defaults({
                'getter': getter
            }, infos, {

            });
            return this;
        },

        /*
         *  Search by query
         */
        query: function(query, callback, context) {
            callback = _.bind(callback, context);

            _.each(this.handlers, function(handler, name) {
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