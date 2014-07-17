define([
    "hr/utils",
    "hr/promise",
    "hr/hr",
    "views/dialogs/container",
    "views/dialogs/input",
    "views/dialogs/list",
    "text!resources/templates/dialogs/alert.html"
], function(_, Q, hr, Dialog, DialogInputView, DialogListView, alertTemplate) {

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
    var openInput = function(viewOptions, options, View) {
        return open(View || DialogInputView, _.extend(options || {}, {
            view: viewOptions || {}
        }))
        .then(function(view) {
            if (view.value == null) return Q.reject(new Error(""));
            return view.value;
        });
    };

    // Alert
    var openAlert = function(text, options) {
        return openInput({
            template: alertTemplate,
            text: text
        });
    };

    // List
    var openList = function(collection, options) {
        if (_.isArray(collection)) {
            collection = new hr.Collection({
                models: _.map(collection, function(item) {
                    if (!_.isObject(item)) return { value: item };
                    return item;
                })
            });
        }

        options = _.defaults(options || {}, {
            template: "<%- item.get('value') %>"
        });

        return openInput({
            collection: collection,
            template: options.template,
        }, {}, DialogListView);
    };

    return {
        open: open,
        alert: openAlert,
        list: openList
    };
});