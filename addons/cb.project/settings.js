define([], function() {
    var settings = codebox.require("core/settings");

    // Add settings
    return settings.add({
        'namespace': "project",
        'title': "Project",
        'defaults': {
            'openrundialog': true
        },
        'fields': {
            'openrundialog': {
                'label': "Open Run Dialog",
                'type': "checkbox",
                'help': "Open new window when running application."
            },
        }
    });
});