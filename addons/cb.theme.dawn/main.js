define([
    'ace/theme'
], function(aceTheme) {
    var themes = codebox.require("core/themes");

    themes.add({
        id: "dawn",
        title: "Dawn",

        editor: {
            'theme': aceTheme
        }
    });
});
