var path = require("path");

module.exports = {
    id: "makefile",
    name: "Makefile",

    detector: path.resolve(__dirname, "detector.sh"),
    runner: [
        {
            id: "all",
            type: "build",
            script: path.resolve(__dirname, "run_all.sh")
        },
        {
            id: "clean",
            type: "clean",
            script: path.resolve(__dirname, "run_clean.sh")
        }
    ]
};