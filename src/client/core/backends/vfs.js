define([
    'hr/hr'
], function(hr) {
    var logger = hr.Logger.addNamespace("vfs");

    var vfs = new hr.Backend({
        prefix: "vfs"
    });

    // Map vfs method -> http request method
    var methodsMap = {
        "read": "getJSON",
        "write": "put",
        "change": "post",
        "delete": "delete",
        "download": "get"
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

    // Read file or directory
    vfs.addMethod('read', {
        fallback: function(args, options) {

        }
    });

    return vfs;
});