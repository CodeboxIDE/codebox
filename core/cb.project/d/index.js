var path = require("path");

module.exports = {
    id: "d",
    name: "D",

    detector: path.resolve(__dirname, "detector.sh"),
    runner: path.resolve(__dirname, "run.sh")
};