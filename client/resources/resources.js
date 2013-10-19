define([
    "hr/hr",

    "text!resources/i18n/en.json"
], function(hr) {

	// Load templates using HTTP
    hr.Resources.addNamespace("templates", {
        loader: "http",
        base: "templates"
    });

    // Load lang using require
    hr.Resources.addNamespace("i18n", {
        loader: "require",
        base: "resources/i18n",
        mode: "text",
        extension: ".json"
    });
    hr.I18n.loadLocale(["en"]);
    
    return {}
});