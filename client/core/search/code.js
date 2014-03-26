define([
    'hr/promise',
    'hr/utils',
    'hr/hr',
    'models/command',
    'core/commands/menu',
    'core/backends/rpc',
    'core/search',
    'core/files',
    'utils/dialogs'
], function(Q, _, hr, Command, menu, rpc, search, files, dialogs) {
    var logging = hr.Logger.addNamespace("codeSearch");
    var OPTIONS = [
        'query', 'path', 'casesensitive', 'replacement', 'pattern', 'maxresults',
        'wholeword', 'regexp', 'replaceAll'
    ];


    // Normalize results as a buffer
    var normResults = function(results) {
        // Header
        var buffer = 'Searching 1 file for "'+results.options.query+'"';
        if (results.options.casesensitive) buffer += " (case sensitive)"
        buffer += '\n\n';

        _.each(results.files, function(lines, path) {
            buffer += path+"\n";
            _.each(lines, function(line) {
                buffer += line.line+"  "+line.content+"\n";
            });
            buffer += '\n\n';
        });

        // Footer
        buffer += results.matches+" matches across "+_.size(results.files)+" files";

        return buffer;
    };

    // Do a basic search
    var searchCode = function(options) {
        options =  _.extend({}, options || {});
        return rpc.execute("search/code", _.pick(options, OPTIONS));
    };

    

    var searchCommandHandler = function(title, fields, forceOptions) {
        return function(args) {
            if (_.isString(args)) args = {'query': args};
            args = _.defaults(args || {}, {});

            var doSearch = function(_args) {
                return searchCode(_.extend(_args, forceOptions || {}))
                .then(function(results) {
                    return normResults(results);
                }, function(err) {
                    logging.error("error", err);
                    return "Error during search: "+(err.message || err);
                })
                .then(function(buffer) {
                    return files.openNew("Find Results", buffer);
                });
            };

            if (!args.query) {
                return dialogs.fields(title, fields, args)
                .then(doSearch);
            }

            return doSearch(args);
        }
    };


    // Command search code
    var commandSearch = Command.register("code.search", {
        title: "Find in Files",
        category: "Find",
        shortcuts: [
            "mod+shift+f"
        ],
        action: searchCommandHandler("Find in Files", {
            'query': {
                'label': "Find",
                'type': "text"
            },
            'path': {
                'label': "Where",
                'type': "text"
            },
            'regexp': {
                'label': "Regular expression",
                'type': "checkbox"
            },
            'casesensitive': {
                'label': "Case sensitive",
                'type': "checkbox"
            },
            'wholeword': {
                'label': "Whole word",
                'type': "checkbox"
            }
        })
    });

    // Command replace code
    var commandReplace = Command.register("code.replace", {
        title: "Replace in Files",
        category: "Find",
        shortcuts: [],
        action: searchCommandHandler("Find and Replace in Files", {
            'query': {
                'label': "Find",
                'type': "text"
            },
            'path': {
                'label': "Where",
                'type': "text"
            },
            'replacement': {
                'label': "Replace",
                'type': "text"
            },
            'regexp': {
                'label': "Regular expression",
                'type': "checkbox"
            },
            'casesensitive': {
                'label': "Case Sensitive",
                'type': "checkbox"
            },
            'wholeword': {
                'label': "Whole word",
                'type': "checkbox"
            }
        }, {
            replaceAll: true
        })
    })


    // Create find menu
    menu.register("find", {
        title: "Find",
        position: 5
    }).menuSection([
        commandSearch,
        commandReplace
    ]);

    return {
        search: searchCode
    };
});