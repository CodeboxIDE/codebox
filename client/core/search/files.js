define([
    'hr/promise',
    'hr/utils',
    'hr/hr',
    'core/box',
    'core/search',
    'core/files'
], function(Q, _, hr, box, search, files) {
    // Search for files
    search.handler({
        'id': "files",
        'title': "Files"
    }, function(query) {
        if (!query) return [];

        return box.searchFiles(query)
        .then(function(data) {
            return Q(_.map(data.files, _.bind(function(path) {
                var filename = _.last(path.split("/"));
                if (filename.length == 0) filename = path;

                return {
                    "title": path,
                    "icons": {
                        "search": "file-o"
                    },
                    "action": _.bind(function() {
                        files.open(path);
                    }, this)
                };
            }, this)));
        });
    });

    // Search for recent opned files
    search.handler({
        'id': "recentfiles",
        'title': "Recent Files"
    }, function(query) {
        return files.recent.map(function(file) {
            return {
                "category": "Recent Files",
                "title": file.path(),
                "position": 0,
                "icons": {
                    "search": "file-o"
                },
                "action": _.bind(function() {
                    files.open(file);
                }, this)
            };
        });
    });
});