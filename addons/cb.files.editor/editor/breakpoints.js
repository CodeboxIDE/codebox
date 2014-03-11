define([], function() {
    var hr = codebox.require("hr/hr");
    var box = codebox.require("core/box");

    var EditorBreakpoints = hr.Class.extend({
        initialize: function() {
            var that = this;
            EditorBreakpoints.__super__.initialize.apply(this, arguments);

            this.editor = this.options.editor;
            this.$editor = this.editor.editor;


            // Breakpoints list change, it signals the change to the box
            this.$editor.session.on("changeBreakpoint", function() {
                box.trigger("debug:breakpoints", {
                    'path': that.editor.model.path(),
                    'list': that.getBreakpoints()
                });
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

                if (_.contains(that.getBreakpoints(), row)) {
                    e.editor.session.clearBreakpoint(row) 
                } else {
                    e.editor.session.setBreakpoint(row);
                }
                e.stop();
            });
        },

        // Return list of active breakpoints in ace
        getBreakpoints: function() {
            return _.chain(this.$editor.session.getBreakpoints())
            .keys()
            .map(function(row) {
                return parseInt(row);
            })
            .value();
        }
    });

    return EditorBreakpoints;
});