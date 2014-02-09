var path = require("path");

module.exports = {
    id: "scala",
    name: "Scala",

    sample: path.resolve(__dirname, "sample"),
    detector: path.resolve(__dirname, "detector.sh")
};