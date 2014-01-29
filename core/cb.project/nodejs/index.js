var path = require("path");

module.exports = {
    id: "nodejs",
    name: "Node.JS",
    detector: path.resolve(__dirname, "detector.sh"),
    ignoredDirectories: [
        "/node_modules"
    ]
};