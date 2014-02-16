define([
    "hr/utils",
    "hr/hr",
    "core/backends/rpc",
    "models/user"
], function(_, hr, rpc, User) {
    var Users = hr.Collection.extend({
        model: User,

        // Return an user from the collection by its user id
        getById: function(userId) {
            return this.find(function(model) {
                return model.get("userId") == userId;
            })
        },

        // Get list of collaborators from the box
        getCollaborators: function() {
            var that = this;
            return rpc.execute("users/list").then(function(data) {
                that.reset(data);
            });
        }
    });

    return Users;
});