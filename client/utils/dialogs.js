define([
    "jQuery",
    "hr/hr",
    "views/dialogs/base"
], function ($, hr, DialogView) {
    var Dialogs = {
        /*
         *  Open a dialog with some configs
         *  @options : option for the dialog
         */
        open: function(cls, options) {
            var d = new hr.Deferred();

            cls = cls || DialogView;
            var diag = new cls(options);

            diag.on("close", function(result) {
                if (result != null) {
                    d.resolve(result);
                } else {
                    d.reject(result);
                }
            });
            diag.render();

            return d;
        },

        /*
         *  Open a promt dialog window
         *  @message : message to print
         *  @defaultmsg : default value
         */
        prompt: function(message, defaultmsg) {
            return Dialogs.open(null, {
                "message": message,
                "dialog": "prompt",
                "default": defaultmsg
            });
        },

        /*
         *  Open a confirmation dialog windows
         *  @message : message to print
         */
        confirm: function(message) {
            return Dialogs.open(null, {
                "message": message,
                "dialog": "confirm"
            });
        },

        /*
         *  Open an alert dialog windows
         *  @message : message to print
         */
        alert: function(title, message) {
            return Dialogs.open(null, {
                "title": title,
                "message": message,
                "dialog": "alert"
            });
        }
    };

    return Dialogs;
});