define([
    "cssgen",
    "defaults/default",
    "defaults/spacegray" 
], function(cssgen, themeDefault, themeSpacegray) {
    var $ = codebox.require("jQuery");
    var hr = codebox.require("hr/hr");
    var settings = codebox.require("core/settings");
    var logger = hr.Logger.addNamespace("themes");

    // Map of themes
    var currentTheme = null;
    var themes = {};

    // CSS dom
    var $css = $("<style>", {
        'type': "text/css"
    }).appendTo($("body"));


    // Add settings
    settings.add({
        'namespace': "themes",
        'title': "Themes",
        'defaults': {
            'theme': 'default'
        },
        'fields': {
            'theme': {
                'label': 'Theme',
                'type': 'select',
                'options': {}
            }
        }
    });


    // Define new themes
    var addTheme = function(properties) {
        if (!properties.id || themes[properties.id]) return false;
        logger.log("add theme", properties.id, properties);
        themes[properties.id] = _.defaults(properties, {
            'styles': {},
            'description': ""
        });
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
                'tabs tab': ".component-tab"
            },
            base: "body #codebox"
        });
        logger.log("Output:", cssContent);
        $css.html(cssContent);

        return true;
    };


    // Defaults themes
    addTheme(themeDefault);
    addTheme(themeSpacegray);

    changeTheme("spacegray");

    return {
        'themes': {
            'add': addTheme,
            'change': changeTheme
        }
    }
});