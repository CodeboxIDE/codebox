var path = require("path");

module.exports = {
    id: "gradle",
    name: "Gradle",

    sample: path.resolve(__dirname, "sample"),
    detector: path.resolve(__dirname, "detector.sh"),
    runner: [
        {
            name: "gradle defaults",
            id: "defaults",
            script: path.resolve(__dirname, "run.sh")
        }
    ]
};