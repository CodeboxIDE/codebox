var path = require("path");

module.exports = {
    id: "nodejs",
    name: "Node.JS",

    sample: path.resolve(__dirname, "sample"),
    detector: path.resolve(__dirname, "detector.sh"),
    runner: [
        {
            name: "npm start",
            id: "run",
            script: path.resolve(__dirname, "run.sh")
        }
    ],

    ignoreRules: [
        "node_modules",
    ]
};
