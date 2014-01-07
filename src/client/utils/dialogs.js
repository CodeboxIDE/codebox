define([
    "q",
    "jQuery",
    "hr/hr",
    "views/dialogs/base"
], function (Q, $, hr, DialogView) {
    var Dialogs = {
        /*
         *  Open a dialog with some configs
         *  @options : option for the dialog
         */
        open: function(cls, options) {
            var d = Q.defer();

            cls = cls || DialogView;
            var diag = new cls(options);

            diag.on("close", function(result) {
                if (result != null) {
                    d.resolve(result);
                } else {
                    d.reject(result);
                }
            });
            diag.update();

            return d.promise;
        },

        /*
         *  Open a promt dialog window
         *  @message : message to print
         *  @defaultmsg : default value
         */
        prompt: function(title, message, defaultmsg) {
            return Dialogs.open(null, {
                "title": title,
                "message": message,
                "dialog": "prompt",
                "default": defaultmsg,
                "autoFocus": true,
                "valueSelector": "selectorPrompt"
            });
        },

        /*
         *  Open a select dialog window
         */
        select: function(title, message, choices, defaultChoice) {
            return Dialogs.open(null, {
                "title": title,
                "message": message,
                "dialog": "select",
                "default": defaultChoice,
                "choices": choices,
                "autoFocus": true,
                "valueSelector": "selectorPrompt"
            });
        },

        /*
         *  Open a confirmation dialog windows
         *  @message : message to print
         */
        confirm: function(title, message) {
            if (!message) {
                message = title;
                title = null;
            }

            return Dialogs.open(null, {
                "title": title,
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