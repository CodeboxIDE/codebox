define([
    'ace/theme'
], function(aceTheme) {
    var themes = codebox.require("core/themes");

    themes.add({
        id: "katzenmilch",
        title: "Katzenmilch",

        editor: {
            'theme': aceTheme
        }
    });
});
