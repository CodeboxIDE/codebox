define([
    'hr/promise',
    'hr/utils',
    'hr/hr',
    'core/backends/rpc',
    'core/search',
    'core/files'
], function(Q, _, hr, rpc, search, files) {
    var normalizeTag = function(tag) {
        return {
            "title": tag.name,
            "icons": {
                "search": "code"
            },
            "action": _.bind(function() {
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
        }).then(function(data) {
            return _.map(data.results, normalizeTag);
        }, function() {
            return Q([]);
        });
    });
});