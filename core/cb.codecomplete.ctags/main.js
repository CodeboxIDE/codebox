var _ = require("underscore");
var tags = require("./tags");

function setup(options, imports, register) {
    var codecomplete = imports.codecomplete;
    var workspace = imports.workspace;

    // Normalize a tag
    var normalizeTag = function(tag) {
        return {
            'name': tag.name,
            'file': tag.file.replace(workspace.root, "")
        }
    };
    

    // Populate the tags index
    var populate = function(options) {
        return tags.get(options.root).then(function(_tags) {
            return _.map(_tags, normalizeTag);
        })
    };

    // Create codecomplete index
    codecomplete.addIndex("ctags", populate, {
        interval: 10*60*1000
    })

    register(null, {});
}

// Exports
module.exports = setup;
