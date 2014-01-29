var path = require("path");

module.exports = {
    id: "php",
    name: "PHP",

    detector: path.resolve(__dirname, "detector.sh"),
    runner: path.resolve(__dirname, "run.sh")
};