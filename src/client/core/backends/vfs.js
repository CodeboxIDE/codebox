define([
    'hr/hr'
], function(hr) {
    var vfs = new hr.Backend({
        prefix: "vfs"
    });

    vfs.addMethod('*', {
        execute: function(args, options, method) {
            if (args) {
                args = JSON.stringify(args);
            }
            if (!options.url) return Q.reject(new Error("VFS requests need 'url' option"));
            return hr.Requests[method](options.url, args, options);
        }
    });

    return vfs;
});