var path = require("path");

module.exports = {
    id: "gradle",
    name: "Gradle",

    sample: path.resolve(__dirname, "sample"),
    detector: path.resolve(__dirname, "detector.sh"),
    runner: [
        {
            id: "defaults",
            script: path.resolve(__dirname, "run.sh")
        }
    ]
};