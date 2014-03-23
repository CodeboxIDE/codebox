var path = require("path");

module.exports = {
    id: "maven",
    name: "Maven",

    detector: path.resolve(__dirname, "detector.sh"),
    runner: [
        {
            id: "run",
            script: path.resolve(__dirname, "run.sh")
        },
        {
            id: "install",
            script: path.resolve(__dirname, "install.sh")
        }
    ]
};
