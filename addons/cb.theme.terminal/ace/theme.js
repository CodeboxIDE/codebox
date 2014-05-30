define([
    "css!ace/theme.css"
], function(cssContent) {

    return {
        'isDark': true,
        'cssClass': "ace-terminal-theme",
        'cssText': cssContent
    }
});
