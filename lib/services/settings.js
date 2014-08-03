var hooks = require("../hooks");

var getSettings = function(args, meta) {
    return hooks.use("settings.get", {
        user: meta.user.id
    });
};

var setSettings = function(args, meta) {
    return hooks.use("settings.set", {
        user: meta.user.id,
        settings: args
    });
};

module.exports ={
    get: getSettings,
    set: setSettings
};
