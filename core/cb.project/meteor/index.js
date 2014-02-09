var path = require("path");

module.exports = {
    id: "meteor",
    name: "Meteor",

    sample: path.resolve(__dirname, "sample"),
    detector: path.resolve(__dirname, "detector.sh"),
    runner: [
        {
            name: "meteor run",
            id: "run",
            script: path.resolve(__dirname, "run.sh")
        },
        {
            name: "meteorite update",
            id: "update",
            script: path.resolve(__dirname, "mrt_update.sh")
        },
        {
            name: "meteorite install",
            id: "install",
            script: path.resolve(__dirname, "mrt_install.sh")
        },
    ],

    ignoreRules: [
        "node_modules",
        ".meteor",
    ]
};
