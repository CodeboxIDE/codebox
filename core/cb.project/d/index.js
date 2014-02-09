var path = require("path");

module.exports = {
    id: "d",
    name: "D",

    sample: path.resolve(__dirname, "sample"),
    detector: path.resolve(__dirname, "detector.sh"),
    runner: [
        {
            id: "run",
            script: path.resolve(__dirname, "run.sh")
        }
    ]
};