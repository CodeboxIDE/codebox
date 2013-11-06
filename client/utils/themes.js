define([
    'jQuery',
    'hr/hr'
], function ($, hr) {

    /*
     *  This module define a unify way to manage themes
     */

    var logging = hr.Logger.addNamespace("themes");

    var themes = {
        /*
         *  Add theme
         */
        add: function(themeId) {
            $("body").addClass("theme-"+themeId);
        }
    };

    return themes;
});