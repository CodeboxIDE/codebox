define([
    "ace/ext/language_tools"
], function(langTools) {
    var rpc = codebox.require("core/backends/rpc");

    var normalizeTag = function(tag) {
        return {
            'name': tag.name,
            'value': tag.name,
            'score': 0,
            'meta': tag.meta || ""
        };
    };

    langTools.addCompleter({
        getCompletions: function(editor, session, pos, prefix, callback) {
            if (prefix.length === 0) { callback(null, []); return }

            rpc.execute("codecomplete/get", {
                'query': prefix
            }).then(function(results) {
                callback(null, _.map(results, normalizeTag));
            }, function(err) {
                callback(err);
            });
        }
    });

    return {};
});