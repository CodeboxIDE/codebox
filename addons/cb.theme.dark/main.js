define([
    'ace/theme'
], function(aceTheme) {
    var themes = codebox.require("core/themes");

    var bgDark = "#222830";
    var colorDark = "#64737e";

    var bgNormal = "#1c1f25";
    var colorNormal = "#dfe0e6";

    var bgLight = "#2b303b";
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
                'border-color': "#111",

                button: {
                    'border-color': bgNormal,
                    'border-bottom-color': "transparent"
                }
            },

            // Lateral bar panels
            lateralbar: {
                'background': bgDark,

                commands: {
                    'background': bgDark,
                    'color': colorLight
                },
                body: {
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
            },

            // Operations
            operations: {
                operation: {
                    'background': bgLight,
                    'color': "#fff",
                    'border-color': "transparent"
                }
            },

            // Alerts
            alerts: {
                alert: {
                    'background': bgLight,
                    'color': colorLight,
                    'border-color': "transparent"
                }
            }
        }
    });
});