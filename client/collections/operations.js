define([
    "hr/utils",
    "hr/hr",
    "hr/promise",
    "models/operation",
    "utils/dialogs"
], function(_, hr, Q, Operation, dialogs) {
    var Operations = hr.Collection.extend({
        model: Operation,

        // Sort comparator
        comparator: function(command) {
            return command.get("progress", 0);
        },

        // Get by id
        getById: function(opId) {
            return this.find(function(op) {
                return op.id == opId;
            });
        },

        // Start an operation
        start: function(opId, startMethod, properties, options) {
            var op, d;

            options = _.defaults({}, options || {}, {
                'unique': true
            });

            op = this.getById(opId);

            if (op) return Q.reject(new Error("An operation with this id is already running: "+opId));

            op = new Operation({}, _.extend({
                'id': opId
            }, properties || {}));

            this.add(op);

            if (startMethod) {
                d = startMethod(op);

                // Error during the operation
                d.fail(function(err) {
                    dialogs.alert("Error during an operation ("+_.escape(opId)+")", err.message || err);
                });

                // Progress
                d.progress(function(p) {
                    if (_.isNumber(p)) op.progress(p);
                });

                // Destroy the operation
                d.fin(function() {
                    op.destroy();
                });
                return d;
            } else {
                return op;
            }
        }
    });

    return Operations;
});