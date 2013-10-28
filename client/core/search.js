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
        handler: function(name, getter) {
            this.handlers[name] = getter;
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
                        'title': name
                    }, results, query);
                };
                var d = handler(query);

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