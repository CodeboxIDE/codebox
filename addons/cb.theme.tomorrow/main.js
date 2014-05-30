define([
    'ace/theme'
], function(aceTheme) {
    var themes = codebox.require("core/themes");

    themes.add({
        id: "tomorrow",
        title: "Tomorrow",

        editor: {
            'theme': aceTheme
        }
    });
});
