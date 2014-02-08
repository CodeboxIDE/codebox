var path = require("path");

module.exports = {
    id: "php",
    otherIds: ["hhvm"],
    name: "PHP",

    sample: path.resolve(__dirname, "sample"),
    detector: path.resolve(__dirname, "detector.sh"),
    runner: [
        {
            name: "php",
            id: "run",
            script: path.resolve(__dirname, "run.sh"),

            // This has a higher priority
            // because the apache runner is buggy for now
            // because of SIGWINCH restarting apache
            // causing the runner to be killed on terminal resizes
            score: 2
        },
        {
            name: "apache",
            id: "run_apache",
            script: path.resolve(__dirname, "run_apache.sh")
        }
    ]
};
