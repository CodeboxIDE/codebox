define([
    "hr/utils",
    "hr/promise",
    "hr/hr",
    "views/dialogs/container",
    "views/dialogs/input",
    "text!resources/templates/dialogs/alert.html"
], function(_, Q, hr, Dialog, DialogInputView, alertTemplate) {

    // Open a dialog
    var open = function(View, options) {
        var d = Q.defer();

        // Create the dialog
        var diag = new Dialog(_.extend(options || {}, {
            View: View
        }));

        // Bind close
        diag.on("close", function() {
            d.resolve(diag.view);
        });

        // Open it (add it to dom)
        diag.render();

        return d.promise;
    };

    // Input dialog
    var input = function(viewOptions, options) {
        return open(DialogInputView, _.extend(options || {}, {
            view: viewOptions || {}
        }))
        .then(function(view) {
            if (view.value == null) return Q.reject(new Error(""));
            return view.value;
        });
    };

    // Alert
    var openAlert = function(text, options) {
        return input({
            template: alertTemplate,
            text: text
        });
    };

    return {
        open: open,
        alert: openAlert
    };
});