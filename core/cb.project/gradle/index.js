var path = require("path");

module.exports = {
    id: "gradle",
    name: "Gradle",

    detector: path.resolve(__dirname, "detector.sh")
};