define([
    'ace/theme'
], function(aceTheme) {
    var themes = codebox.require("core/themes");

    themes.add({
        id: "solarized.light",
        title: "Solarized Light",

        editor: {
            'theme': aceTheme
        }
    });
});
