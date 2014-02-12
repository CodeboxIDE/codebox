var path = require("path");

module.exports = {
    id: "dart",
    name: "Dart",
    
    sample: path.resolve(__dirname, "sample"),
    detector: path.resolve(__dirname, "detector.sh"),
    runner: [
        {
            id: "pub:serve",
            type: "run",
            script: path.resolve(__dirname, "run_serve.sh")
        },
        {
            id: "pub:build",
            type: "build",
            script: path.resolve(__dirname, "run_build.sh")
        },
        {
            id: "clean",
            type: "clean",
            script: path.resolve(__dirname, "run_clean.sh")
        }
    ],

    ignoreRules: [
        "build",
    ]
};