define([
    'Underscore',
    'jQuery',
    'hr/hr',
    'utils/languages'
], function (_, $, hr, Languages) {
    return {
    	/*
         *  Return file mode (for ace editor)
         */
        mode: function(file) {
            return Languages.get_mode_byextension(file.extension());
        },

        /*
         *  Return color to represent the file
         */
        color: function(file, def) {
            if (file.isDirectory()) {
                return def;
            }
            return Languages.get_color_byext(file.extension(), def);
        },
    };
});