var path = require("path");

module.exports = {
    id: "go",
    name: "Go",

    detector: path.resolve(__dirname, "detector.sh"),
    runner: path.resolve(__dirname, "run.sh")
};