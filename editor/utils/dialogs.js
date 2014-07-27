define([
    "hr/utils",
    "hr/promise",
    "hr/hr",
    "views/dialogs/container",
    "views/dialogs/input",
    "views/dialogs/list",
    "text!resources/templates/dialogs/alert.html",
    "text!resources/templates/dialogs/confirm.html",
    "text!resources/templates/dialogs/prompt.html",
    "text!resources/templates/dialogs/schema.html"
], function(_, Q, hr, Dialog, DialogInputView, DialogListView,
alertTemplate, confirmTemplate, promptTemplate, schemaTemplate) {

    // Open a dialog
    var open = function(View, options) {
        var d = Q.defer();

        // Create the dialog
        var diag = new Dialog(_.extend(options || {}, {
            View: View
        }));

        // Bind close
        diag.on("close", function(force) {
            if (force) return d.reject(new Error("Dialog was been closed"));
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
            var value = view.getValue();

            if (value == null) return Q.reject(new Error("Dialog return empty value"));
            return value;
        });
    };

    // Alert
    var openAlert = function(text, options) {
        return openInput({
            template: alertTemplate,
            text: text
        });
    };
    var openErrorAlert = function(err) {
        return openAlert("Error: "+(err.message || err))
        .fin(function() {
            return Q.reject(err);
        });
    };

    // Confirm
    var openConfirm = function(text, options) {
        return openInput({
            template: confirmTemplate,
            text: text
        });
    };

    // Prompt
    var openPrompt = function(text, value, options) {
        return openInput({
            template: promptTemplate,
            text: text,
            defaultValue: value,
            value: function(d) { return d.$("input").val(); }
        });
    };

    // List
    var openList = function(source, options) {
        if (_.isArray(source)) {
            source = new hr.Collection({
                models: _.map(source, function(item) {
                    if (!_.isObject(item)) return { value: item };
                    return item;
                })
            });
        }

        return openInput(
            _.extend({
                template: "<%- item.get('value') %>",
                placeholder: "",
                filter: function() { return true; }
            }, options, {
                source: source
            }), {}, DialogListView);
    };

    // Schema
    var openSchema = function(schema, values) {
        values = values || {};

        return openInput({
            template: schemaTemplate,
            schema: schema,
            defaultValues: values,
            value: function(d) {
                var nvalues = _.clone(values);

                _.each(schema.properties, function(property, key) {
                    var v = d.$("*[name='"+key+"']").val();
                    nvalues[key] = v;
                });

                return nvalues;
            }
        });
    };

    return {
        open: open,
        alert: openAlert,
        error: openErrorAlert,
        confirm: openConfirm,
        prompt: openPrompt,
        list: openList,
        schema: openSchema
    };
});