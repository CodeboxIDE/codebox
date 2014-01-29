var path = require("path");

module.exports = {
    id: "static",
    name: "Static",

    detector: path.resolve(__dirname, "detector.sh"),
    runner: path.resolve(__dirname, "run.sh")
};