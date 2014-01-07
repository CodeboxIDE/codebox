define([
    'ace/theme'
], function(aceTheme) {
    var themes = codebox.require("core/themes");

    var bgDark = "#1a1d24";
    var colorDark = "#65737d";

    var bgNormal = "#2b303b";
    var colorNormal = "#dfe0e6";

    var bgLight = "#343c45";
    var colorLight = "#dadfe6";

    themes.add({
        id: "dark",
        title: "Dark",

        editor: {
            'theme': aceTheme
        },
        styles: {
            // Top menubar
            menubar: {
                'background': bgNormal,
                'color': colorNormal,
                'border-color': "#111"
            },

            // Lateral bar panels
            lateralbar: {
                commands: {
                    'background': bgDark,
                    'color': colorLight
                },
                body: {
                    'background': bgDark,
                    'color': colorDark
                }
            },

            // Tabs
            tabs: {
                section: {
                    'border-color': bgDark
                },
                header: {
                    'background': bgDark,
                    'color': colorDark
                },
                content: {
                    'background': bgLight,
                },
                tab: {
                    '&.active': {
                        'background': bgLight,
                        'color': colorLight
                    }
                }
            }
        }
    });
});