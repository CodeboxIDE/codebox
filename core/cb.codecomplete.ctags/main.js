var tags = require("./tags");

function setup(options, imports, register) {
    var codecomplete = imports.codecomplete;
    var workspace = imports.workspace;    

    // Populate the tags index
    var populate = function(options) {
        // get list of files to index
        return options.project.getValidFiles().then(function(files) {
            // get tags
            return tags.get(options.root, files)
        });
    };

    // Create codecomplete index
    codecomplete.addIndex("ctags", populate, {
        interval: 60*1000
    })

    register(null, {});
}

// Exports
module.exports = setup;
