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
            script: path.resolve(__dirname, "run.sh")
        },
        {
            name: "apache",
            id: "run_apache",
            script: path.resolve(__dirname, "run_apache.sh")
        }
    ]
};
