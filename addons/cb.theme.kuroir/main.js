define([
    'ace/theme'
], function(aceTheme) {
    var themes = codebox.require("core/themes");

    themes.add({
        id: "kuroir",
        title: "Kuroir",

        editor: {
            'theme': aceTheme
        }
    });
});
