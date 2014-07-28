var hooks = require("../hooks");

var getSettings = function() {
    return hooks.use("settings.get");
};

var setSettings = function(args) {
    return hooks.use("settings.set", args);
};

module.exports ={
    get: getSettings,
    set: setSettings
};
