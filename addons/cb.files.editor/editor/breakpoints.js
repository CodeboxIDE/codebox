define([], function() {
    var hr = codebox.require("hr/hr");

    var EditorBreakpoints = hr.Class.extend({
        initialize: function() {
            var that = this;
            EditorBreakpoints.__super__.initialize.apply(this, arguments);

            this.editor = this.options.editor;
            this.$editor = this.editor.editor;

            // Breakpoints list change, it signals the change to the box
            this.$editor.session.on("changeBreakpoint", function() {
                that.signalBreakpoints();
            });

            // Add remove breakpoints by clicking the gutter
            this.$editor.on("guttermousedown", function(e) { 
                var target = e.domEvent.target; 
                if (target.className.indexOf("ace_gutter-cell") == -1) 
                    return; 
                if (!e.editor.isFocused()) 
                    return; 
                if (e.clientX > 25 + target.getBoundingClientRect().left) 
                    return; 

                var row = e.getDocumentPosition().row;

                if (that.hasBreakpoint(row)) {
                    e.editor.session.clearBreakpoint(row) 
                } else {
                    e.editor.session.setBreakpoint(row);
                }
                e.stop();
            });

            // Document change -> update breakpoints list
            this.$editor.session.doc.on("change", function(e) {
                var delta = e.data;
                var range = delta.range;
                var changed = false;

                if (range.end.row == range.start.row)
                    return;

                var len, firstRow;
                len = range.end.row - range.start.row;
                if (delta.action == "insertText") {
                    firstRow = range.start.column ? range.start.row + 1 : range.start.row;
                }
                else {
                    firstRow = range.start.row;
                }

                if (delta.action[0] == "i") {
                    var args = Array(len);
                    args.unshift(firstRow, 0);
                    changed = true;
                    that.$editor.session.$breakpoints.splice.apply(that.$editor.session.$breakpoints, args);
                }
                else {
                    var rem = that.$editor.session.$breakpoints.splice(firstRow + 1, len);

                    if (!that.$editor.session.$breakpoints[firstRow]) {
                        for (var i = rem.length; i--; ) {
                            if (rem[i]) {
                                changed = true;
                                that.$editor.session.$breakpoints[firstRow] = rem[i];
                                break;
                            }
                        }
                    }
                }

                if (changed) that.signalBreakpoints();
            });
        },

        // Return list of active breakpoints in ace
        getBreakpoints: function() {
            return _.chain(this.$editor.session.getBreakpoints() || {})
            .map(function(value, key) {
                if (!value) return null;
                return parseInt(key)+1;
            })
            .compact()
            .value();
        },

        // Check if has breakpoint at a line
        hasBreakpoint: function(row) {
            return _.contains(this.getBreakpoints(), row+1)
        },

        // Signal breakpoints list
        signalBreakpoints: function() {
            this.editor.model.setBreakpoints(this.getBreakpoints());
        }
    });

    return EditorBreakpoints;
});