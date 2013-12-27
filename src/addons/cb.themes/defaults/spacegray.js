define([], function() {

    var bgDark = "#1a1d24";
    var colorDark = "#65737d";

    var bgNormal = "#2b303b";
    var colorNormal = "#dfe0e6";

    var bgLight = "#343c45";
    var colorLight = "#dadfe6";

    return {
        id: "spacegray",
        title: "Spacegray",
        description: "Spacegray is all about hype and minimal.",
        editor: {
            theme: "spacegray"
        },
        styles: {
            // Top menubar
            menubar: {
                'background': bgNormal,
                'color': colorNormal,
                'border-color': "transparent",
                'box-shadow': "none"
            },

            // Lateral bar panels
            lateralbar: {
                commands: {
                    'background': bgDark,
                    'color': colorLight,
                    'border-color': "transparent",
                    'box-shadow': "none"
                },
                body: {
                    'background': bgDark,
                    'color': colorDark,
                    'border-color': "transparent",
                    'box-shadow': "none"
                }
            },

            // Tabs
            tabs: {
                section: {
                    'border-color': bgDark
                },
                header: {
                    'background': bgDark,
                    'color': colorDark,
                    'border-color': "transparent",
                    'box-shadow': "none"
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
    };
});