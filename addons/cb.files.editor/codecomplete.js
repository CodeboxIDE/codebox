define([
    "ace"
], function(ace) {
    var rpc = codebox.require("core/backends/rpc");
    var langTools = ace.require("ace/ext/language_tools");

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
            }).then(function(data) {
                callback(null, _.map(data.results, normalizeTag));
            }, function(err) {
                callback(err);
            });
        }
    });

    return {};
});