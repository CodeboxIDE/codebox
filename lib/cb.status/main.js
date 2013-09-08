// Requires



function setup(options, imports, register) {
    var app = imports.server.app;
    var workspace = imports.workspace;

    function status(req, res) {
        return res.send({
            status: "ok",
            uptime: process.uptime(),
            mtime: workspace.mtime,
            collaborators: workspace.userCount(),
        });
    }

    // Status
    app.get('/', status);

    register(null, {});
}

// Exports
module.exports = setup;