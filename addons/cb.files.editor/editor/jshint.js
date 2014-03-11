define([], function() {
    var File = codebox.require("models/file");
    var box = codebox.require("core/box");
    var Q = codebox.require("hr/promise");
    var _ = codebox.require("hr/utils");

    var jshintFile = new File();

    // Read the JSHint configuration from a file
    var readJshintSettings = _.memoize(function() {
        // Get file
        return jshintFile.getByPath("/.jshintrc")
        .then(function() {
            //Read file
            return jshintFile.read();
        })
        .then(function(content) {
            // Parse JSON
            return JSON.parse(content);
        });
    });

    // Apply JSHint config from a file to an editor
    var applyJshintSettings = function(editor) {
        var session = editor.session;
        if (session.getMode().$id != "ace/mode/javascript") return Q.reject(new Error("Not a javascript editor"));
        if (!session.$worker) return Q.reject(new Error("No JSHint worker"));

        return readJshintSettings()
        .then(function(options) {
            if (session.$worker) {
                //session.$worker.send("changeOptions",[ {undef: true}])
                // or
                session.$worker.send("setOptions",[options])
            }
            return options;
        });
    };

    // Clear memoize cache when file change
    jshintFile.on("file:change", function(e) {
        readJshintSettings.cache = {};
    });

    return {
        'applySettings': applyJshintSettings
    };
});