define([
    'ace/theme'
], function(aceTheme) {
    var themes = codebox.require("core/themes");

    themes.add({
        id: "textmate",
        title: "Textmate",

        editor: {
            'theme': aceTheme
        }
    });
});
