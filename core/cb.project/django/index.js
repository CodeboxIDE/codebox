var path = require("path");

module.exports = {
    id: "django",
    name: "Django",

    detector: path.resolve(__dirname, "detector.sh"),
    runner: [
        {
            id: "run",
            script: path.resolve(__dirname, "run.sh")
        }
    ]
};
