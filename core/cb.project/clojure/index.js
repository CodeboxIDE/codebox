var path = require("path");

module.exports = {
    id: "clojure",
    name: "Clojure",

    detector: path.resolve(__dirname, "detector.sh"),
    sample: path.resolve(__dirname, "sample"),
};
