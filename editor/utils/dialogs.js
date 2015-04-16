var _ = require("hr.utils");
var Q = require("q");
var Collection = require("hr.collection");

var Dialog = require("../views/dialogs/container");
var DialogInputView = require("../views/dialogs/input");
var DialogListView = require("../views/dialogs/list");

var alertTemplate = require("../resources/templates/dialogs/alert.html");
var confirmTemplate = require("../resources/templates/dialogs/confirm.html");
var promptTemplate = require("../resources/templates/dialogs/prompt.html");
var schemaTemplate = require("../resources/templates/dialogs/schema.html");

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
    diag.update();

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
    options = _.defaults(options || {}, {
        isHtml: false
    });
    return openInput({
        template: alertTemplate,
        text: text,
        isHtml: options.isHtml
    });
};
var openErrorAlert = function(err) {
    console.log("error", err);
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
        source = new Collection({
            models: _.map(source, function(item) {
                if (!_.isObject(item)) return { value: item };
                return item;
            })
        });
    }

    return openInput(
        _.extend({
            template: "<div class='item-text'><%- item.get('value') %></div>",
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


module.exports = {
    open: open,
    alert: openAlert,
    error: openErrorAlert,
    confirm: openConfirm,
    prompt: openPrompt,
    list: openList,
    schema: openSchema,
    input: openInput
};
