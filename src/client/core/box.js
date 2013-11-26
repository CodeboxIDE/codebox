define([
    'q',
    'hr/hr',
    'models/box',
    'core/search',
    'core/commands',
    'core/collaborators'
], function (Q, hr, Codebox, search, commands, collaborators) {
    // Current box
    var box = new Codebox();

    // Bind collaborators changement
    box.on("box:users:add", function(e) {
        collaborators.add(e.data);
    });
    box.on("box:users:remove", function(e) {
        collaborators.remove(collaborators.getById(e.data.userId));
    });

    return box;
});