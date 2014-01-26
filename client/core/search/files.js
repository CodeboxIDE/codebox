define([
    'q',
    'underscore',
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
        return box.searchFiles(query).then(function(data) {
            return Q(_.map(data.files, _.bind(function(path) {
                var filename = _.last(path.split("/"));
                if (filename.length == 0) filename = path;
                return {
                    "text": filename,
                    "callback": _.bind(function() {
                        files.open(path);
                    }, this)
                };
            }, this)));
        });
    });
});