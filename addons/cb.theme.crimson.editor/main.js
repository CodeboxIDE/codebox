define([
    'ace/theme'
], function(aceTheme) {
    var themes = codebox.require("core/themes");

    themes.add({
        id: "crimson.editor",
        title: "Crimson Editor",

        editor: {
            'theme': aceTheme
        }
    });
});
