define([
    'ace/theme'
], function(aceTheme) {
    var themes = codebox.require("core/themes");

    themes.add({
        id: "xcode",
        title: "Xcode",

        editor: {
            'theme': aceTheme
        }
    });
});
