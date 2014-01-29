var path = require("path");

module.exports = {
    id: "play",
    name: "Play",

    detector: path.resolve(__dirname, "detector.sh"),
    runner: path.resolve(__dirname, "run.sh")
};