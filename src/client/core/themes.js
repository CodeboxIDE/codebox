define([
    'hr/hr',
    'jQuery',
    'underscore',
    'utils/css',
    'core/settings'
], function (hr, $, _, css, settings) {
    var logger = hr.Logger.addNamespace("themes");

    // Map of themes
    var currentTheme = null;
    var themes = {};

    // CSS dom
    var $css = $("<style>", {
        'type': "text/css"
    }).appendTo($("body"));

    // Add settings
    var themeSettings = settings.add({
        'namespace': "themes",
        'title': "Themes",
        'defaults': {
            'theme': 'default'
        },
        'fields': {
            
        }
    });

    // Update theme settings
    var updateThemeSettings = function() {
        themeSettings.setField("theme", {
            'label': "Themes",
            'type': "select",
            'options': _.object(_.map(themes, function(theme, themeId) {
                return [theme.id, theme.title]
            }))
        });
    };


    // Define new themes
    var addTheme = function(properties) {
        if (!properties.id || themes[properties.id]) return false;
        logger.log("add theme", properties.id, properties);
        themes[properties.id] = _.defaults(properties, {
            'styles': {},
            'description': ""
        });
        updateThemeSettings();
    };

    // Change theme
    var changeTheme = function(themeId) {
        var cssContent, theme = themes[themeId];
        if (!theme) return false;

        // Set current theme
        currentTheme = themeId;

        cssContent = cssgen.convert(theme.styles, {
            namespace: {
                // menu bar
                'menubar': ".cb-menubar",

                // lateral bar
                'lateralbar commands': ".cb-lateralbar .lateral-commands",
                'lateralbar body': ".cb-lateralbar .lateral-body",

                // tabs
                'tabs section': ".cb-tabs .section",
                'tabs header': ".cb-tabs .section .tabs-header",
                'tabs content': ".cb-tabs .section .tabs-content",
                'tabs tab': ".component-tab"
            },
            base: "body #codebox"
        });
        logger.log("Output:", cssContent);
        $css.html(cssContent);

        return true;
    };

    // Return current theme
    var currentTheme = function() {
        return themes[currentTheme];
    };

    return {
        'add': addTheme,
        'change': changeTheme,
        'current': currentTheme
    };
});