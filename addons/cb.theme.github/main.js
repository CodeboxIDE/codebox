define([
    'ace/theme'
], function(aceTheme) {
    var themes = codebox.require("core/themes");

    themes.add({
        id: "github",
        title: "Github",

        editor: {
            'theme': aceTheme
        }
    });
});
