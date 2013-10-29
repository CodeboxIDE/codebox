define([
    "hr/hr"
], function(hr) {
	// Load templates using HTTP
    hr.Resources.addNamespace("templates", {
        loader: "http",
        base: "templates"
    });
    
    return {}
});