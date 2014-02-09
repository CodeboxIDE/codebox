var path = require("path");

module.exports = {
    id: "grails",
    name: "Grails",
    
    detector: path.resolve(__dirname, "detector.sh"),
    runner: [
        {
            id: "run-app",
            script: path.resolve(__dirname, "run.sh")
        }
    ]
};