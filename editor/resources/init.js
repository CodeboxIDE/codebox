define([
    "hr/hr",
    "hr/promise"
], function(hr, Q) {
    hr.Resources.addNamespace("templates", {
        loader: "text"
    });

    return function() {
        return Q();
    };
});