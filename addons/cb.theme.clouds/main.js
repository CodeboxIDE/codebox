define([
    'ace/theme'
], function(aceTheme) {
    var themes = codebox.require("core/themes");

    themes.add({
        id: "clouds",
        title: "Clouds",

        editor: {
            'theme': aceTheme
        }
    });
});
