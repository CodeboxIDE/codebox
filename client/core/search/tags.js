define([
    'q',
    'underscore',
    'hr/hr',
    'core/backends/rpc',
    'core/search',
    'core/files'
], function(Q, _, hr, rpc, search, files) {
    var normalizeTag = function(tag) {
        return {
            "text": tag.name,
            "callback": _.bind(function() {
                files.open(tag.file);
            }, this)
        };
    };

    // Search for files
    search.handler({
        'id': "tags",
        'title': "Tags"
    }, function(query) {
        return rpc.execute("codecomplete/get", {
            'query': query
        }).then(function(results) {
            return _.map(results, normalizeTag);
        });
    });
});