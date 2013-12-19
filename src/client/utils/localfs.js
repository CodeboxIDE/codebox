define([
    'underscore',
    'hr/hr',
    'utils/url',
    'vendors/filer'
], function(_, hr, Url, Filer) {
    var logger = hr.Logger.addNamespace("localfs");

    // Create fs interface
    var filer = new Filer();

    var fsCall = function(method, args, context) {
        if (_.isUndefined(args)) args = [];
        if (!_.isArray(args)) args = [args];

        var d = Q.defer();
        args.push(function() {
            if (arguments.length == 1) return d.resolve(arguments[0]);
            d.resolve(arguments);
        });
        args.push(function(err) {
            logger.error("Error occurs: ", err);
            d.reject(err);
        })

        method.apply(context, args);

        return d.promise;
    };

    /*
     *  Init the localfs
     */
    var initFs = function() {
        return fsCall(filer.init, {
            persistent: true,
            size: 10 * 1024 * 1024
        }, filer).then(function() {
            logger.log("ready");
        });
    };

    /*
     *  Convert a vfs url in a path
     */
    var urlToPath = function(url) {
        var path = url.replace("/vfs/", "");
        if (path.length == 0) path = '/';
        if (path[0] != '/') path = "/" + path;
        return path;
    };

    /*
     *  Return informations about a fileentry
     */
    var getEntryInfos = function(fEntry) {
        return fsCall(fEntry.getMetadata, [], fEntry).then(function(metadata) {
            var url = location.protocol+"//"+location.host+"/vfs"+fEntry.fullPath;

            if (fEntry.isDirectory) url = url + "/";

            return {
                "name": fEntry.name,
                "size": metadata.size,
                "mtime": metadata.modificationTime.getTime(),
                "mime": fEntry.isDirectory ? "inode/directory" : "application/octet-stream",
                "href": url,
                "accessUrl": fEntry.toURL(),
                "offline": true
            };
        })
    };

    /*
     *  List a directory
     */
    var listDir = function(path) {
        logger.log("ls:", path);
        return fsCall(filer.ls, path, filer).then(function(entries) {
            return Q.all(_.map(entries, function(entry) {
                return getEntryInfos(entry);
            }))
        }).then(function(entries) {
            logger.log(entries);
            return entries;
        }, function(err) {
            logger.error("ls:", err);
        });
    };

    /*
     *  Create a file
     */
    var createFile = function(path) {
        logger.log("create:", path);
        return fsCall(filer.create, [path, true], filer);
    };

    /*
     *  Write file
     */
    var writeFile = function(path, data) {
        logger.log("write:", path);
        return fsCall(filer.write, [path, {
            'data': data || ""
        }], filer);
    };

    /*
     *  Read a file
     */
    var readFile = function(path) {
        logger.log("read:", path);
        return fsCall(filer.open, [path], filer).then(function(file) {
            var d = Q.defer();

            var reader = new FileReader();
            reader.onerror = function(err) {
                d.reject(err);
            };
            reader.onload = function(e) {
                d.resolve(this.result);
            };
            reader.readAsText(file);

            return d.promise;
        });
    };

    /*
     *  Create a file
     */
    var createDirectory = function(path) {
        logger.log("mkdir:", path);
        return fsCall(filer.mkdir, [path, true], filer);
    };

    /*
     *  Move a file
     */
    var move = function(from, to) {
        logger.log("move:", from, "to", to);
        return fsCall(filer.mv, [from, '.', to], filer);
    };

    /*
     *  Remove a file or directory
     */
    var remove = function(path) {
        logger.log("remove:", path);
        return fsCall(filer.remove, [path], filer);
    };

    return {
        'getEntryInfos': getEntryInfos,
        'urlToPath': urlToPath,
        'init': initFs,
        'ls': listDir,
        'create': createFile,
        'mkdir': createDirectory,
        'write': writeFile,
        'read': readFile,
        'mv': move,
        'rm': remove
    };
});