define([
    "less!theme/textmate.less"
], function(cssContent) {

    return {
        'isDark': false,
        'cssClass': "ace-tm",
        'cssText': cssContent
    }
});