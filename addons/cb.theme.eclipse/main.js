define([
    'ace/theme'
], function(aceTheme) {
    var themes = codebox.require("core/themes");

    themes.add({
        id: "eclipse",
        title: "Eclipse",

        editor: {
            'theme': aceTheme
        }
    });
});
