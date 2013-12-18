define([
    'hr/hr'
], function(hr) {
    var logger = hr.Logger.addNamespace("vfs");

    var vfs = new hr.Backend({
        prefix: "vfs"
    });

    // Map vfs method -> http request method
    var methodsMap = {
        "listdir": "getJSON",
        "write": "put",
        "mkdir": "put",
        "rename": "post",
        "delete": "delete",
        "read": "get"
    };


    // Check if an url is for a diretcoey
    var isDirectory = function(url) {
        return url.substr(-1) == "/";
    };


    // Base method when connexion is on
    vfs.addMethod('*', {
        execute: function(args, options, method) {
            if (args) args = JSON.stringify(args);
            if (!options.url) return Q.reject(new Error("VFS requests need 'url' option"));
            if (!methodsMap[method]) return Q.reject(new Error("Invalid VFS request: "+method));

            logger.log(method+": "+options.url);
            return hr.Requests[methodsMap[method]](options.url, args, options);
        }
    });

    // Read a file content
    vfs.addMethod('read', {
        fallback: function(args, options) {
            var path = options.url;

            // Get content
            var content = hr.Storage.get(path);
            if (!content) return Q.reject(new Error("This path is not available in the local cache"));

            if (isDirectory(path)) return Q.reject(new Error("Reading a directory"));

            return content;
        },
        after: function(args, results, options) {
            // Read file content

        }
    });

    // LIst a directory
    vfs.addMethod('listdir', {
        fallback: function(args, options) {
            var path = options.url;

            // Get content
            var content = hr.Storage.get(path);
            if (!content) return Q.reject(new Error("This path is not available in the local cache"));

            if (!isDirectory(path)) return Q.reject(new Error("listing files in a non-directory"));

            return content;
        },
        after: function(args, results, options) {
            var path = options.url;
            logger.warn("save content for ", path, results);

            hr.Storage.set(path, results);
        }
    });

    return vfs;
});