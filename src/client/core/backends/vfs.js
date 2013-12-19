define([
    'underscore',
    'hr/hr',
    'utils/url'
], function(_, hr, Url) {
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

    // Get node key
    var nodeKey = function(url) {
        return "vfs:"+url;
    }

    // Check that a node exists
    var nodeExists = function(url) {
        return hr.Storage.has(nodeKey(url));
    }

    // Read a node
    var nodeRead = function(url) {
        return hr.Storage.get(nodeKey(url));
    }

    // Write a node
    var nodeWrite = function(url, content) {
        return hr.Storage.set(nodeKey(url), content);
    }

    // Norm a url
    var normUrl =  function(url) {
        return Url.parse(url).path
    }


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

            if (isDirectory(path)) return Q.reject(new Error("Invalid node: directory"));
            if (!nodeExists(path)) return Q.reject(new Error("Invalid node: inexistant"));

            return nodeRead(path);
        },
        after: function(args, results, options) {
            // Read file content

        }
    });

    // List a directory
    vfs.addMethod('listdir', {
        fallback: function(args, options) {
            var path = options.url;

            if (!isDirectory(path)) return Q.reject(new Error("Invalid node: file"));
            if (!nodeExists(path)) return Q.reject(new Error("Invalid node: inexistant"));

            return _.map(nodeRead(path), function(fileInfos) {
                return _.extend(fileInfos, {
                    'offline': nodeExists(normUrl(fileInfos.href))
                });
            });
        },
        after: function(args, results, options) {
            var path = options.url;
            nodeWrite(path, results);
        }
    });

    return vfs;
});