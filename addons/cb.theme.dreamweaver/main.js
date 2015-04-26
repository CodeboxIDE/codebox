define([
    'ace/theme'
], function(aceTheme) {
    var themes = codebox.require("core/themes");

    themes.add({
        id: "dreamweaver",
        title: "Dreamweaver",

        editor: {
            'theme': aceTheme
        }
    });
});
