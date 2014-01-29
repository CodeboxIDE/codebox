var path = require("path");

module.exports = {
    id: "makefile",
    name: "Makefile",

    detector: path.resolve(__dirname, "detector.sh"),
    runner: [
        {
            id: "all",
            script: path.resolve(__dirname, "run_all.sh"),

            // Prioritize procfile execution
            score: 2
        },
        {
            id: "clean",
            type: "clean",
            script: path.resolve(__dirname, "run_clean.sh")
        }
    ]
};