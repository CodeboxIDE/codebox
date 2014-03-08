var path = require("path");

module.exports = {
    id: "procfile",
    name: "Procfile",

    detector: path.resolve(__dirname, "detector.sh"),
    runner: [
        {
            id: "run",
            script: path.resolve(__dirname, "run.sh")
        }
    ]
};