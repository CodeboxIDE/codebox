var path = require("path");

module.exports = {
    id: "node",
    name: "Node.JS",

    sample: path.resolve(__dirname, "sample"),
    detector: path.resolve(__dirname, "detector.sh"),
    runner: [
        {
            name: "npm start",
            id: "run",
            script: path.resolve(__dirname, "run.sh")
        },
        {
            name: "npm install",
            id: "install",
            script: path.resolve(__dirname, "install.sh")
        }
    ],

    ignoreRules: [
        "node_modules",
    ]
};
