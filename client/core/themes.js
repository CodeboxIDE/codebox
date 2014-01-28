define([
    'hr/hr',
    'jQuery',
    'underscore',
    'utils/css',
    'core/settings',
    'core/user'
], function (hr, $, _, css, settings, user) {
    var logger = hr.Logger.addNamespace("themes");


    // User settings
    var userSettings = user.settings("themes");

    // Map of themes
    var currentTheme = null;
    var themes = {};

    // CSS dom
    var $css = $("<style>", {
        'type': "text/css"
    });

    // Add settings
    var themeSettings = settings.add({
        'namespace': "themes",
        'title': "Themes",
        'defaults': {
            'theme': 'dark'
        },
        'fields': {}
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
            'description': "",
            'editor': {}
        });
        updateThemeSettings();

        if (!currentTheme) {
            changeTheme(properties.id);
        }
    };

    // Change theme
    var changeTheme = function(themeId) {
        logger.log("try change theme", themeId, themes);
        var cssContent, theme = themes[themeId];
        if (!theme) return false;

        if (themeId == currentTheme) return true;

        logger.log("change theme", themeId);

        // Set current theme
        currentTheme = themeId;

        cssContent = css.convertJSON(theme.styles, {
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
                'tabs tab': ".component-tab",

                // operations
                'operations operation': ".cb-operations .operation-item",

                // alerts
                'alerts': ".cb-alerts",
                'alerts alert': ".cb-alerts .cb-alert"
            },
            base: "body #codebox"
        });
        $css.html(cssContent);

        return true;
    };

    // Return current theme
    var currentTheme = function() {
        return themes[currentTheme];
    };

    // Update current theme
    var updateCurrentTheme = function() {
        return changeTheme(userSettings.get("theme", "default"));
    };
    

    // Default theme
    addTheme({
        id: "default",
        title: "White"
    });

    // Init theming
    var init = function() {
        // Add css container
        $css.appendTo($("body"));

        // Bind user settings changement
        userSettings.change(updateCurrentTheme);

        // Update current theme
        updateCurrentTheme();

        return Q();
    };

    return {
        'init': init,
        'add': addTheme,
        'change': changeTheme,
        'current': currentTheme
    };
});