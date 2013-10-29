define([
    'hr/hr',
    'models/box',
    'core/search',
    'core/commands'
], function (hr, Codebox, search, commands) {
    // Current box
    var box = new Codebox();

    // Search for files
    search.handler("files", function(query) {
        var d = new hr.Deferred();
        box.searchFiles(query).done(function(data) {
            d.resolve(_.map(data.files, _.bind(function(path) {
                var filename = _.last(path.split("/"));
                if (filename.length == 0) filename = path;
                return {
                    "text": filename,
                    "callback": _.bind(function() {
                        commands.run("files.open", {
                            'path': path
                        });
                    }, this)
                };
            }, this)));
        });
        return d;
    });

    return box;
});