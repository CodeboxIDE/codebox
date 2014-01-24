define([], function() {
    var $ = codebox.require("jQuery");
    var settings = codebox.require("core/settings");

    // Add settings
    return settings.add({
        'namespace': "files-panel",
        'title': "Files Explorer Panel",
        'defaults': {
            'openfiles': true
        },
        'fields': {
            'openfiles': {
                'label': "Show Open Files",
                'type': "checkbox"
            }
        }
    });
});