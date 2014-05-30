define([
    'ace/theme'
], function(aceTheme) {
    var themes = codebox.require("core/themes");

    themes.add({
        id: "chrome",
        title: "Chrome",

        editor: {
            'theme': aceTheme
        }
    });
});
