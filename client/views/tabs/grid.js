define([
    "hr/utils",
    "hr/dom",
    "hr/hr"
], function(_, $, hr) {
    var GridView = hr.View.extend({
        className: "component-grid",
        defaults: {
            columns: 0 // 0 means auto
        },
        events: {
            
        },

        initialize: function() {
            GridView.__super__.initialize.apply(this, arguments);

            this.columns = this.options.columns;
            this.views = [];

            return this;
        },

        /*
         *  Add a view
         */
        addView: function(view) {
            this.views.push(view);
            return this.render();
        },

        /*
         *  Remove a view
         */
        removeView: function(view) {
            if (!_.isString(view)) view = view.cid;

            this.views = _.filter(this.views, function(_v) {
                return _v.cid != view;
            });
            return this.render();
        },

        /*
         *  Change layout by defining 
         */
        setLayout: function(n) {
            this.columns = n;
            return this.render();
        },

        /*
         *  Re-render the complete layout
         */
        render: function() {
            var x, y;
            this.$el.empty();

            // Calcul layout if auto
            var layout = this.columns || Math.floor(Math.sqrt(this.views.length));

            var nColumns = Math.min(layout, this.views.length);
            var nLines = Math.ceil(this.views.length/layout);

            var sectionWidth = (100/nColumns).toFixed(3);
            var sectionHeight = (100/nLines).toFixed(3);

            // Add grid content
            x = 0; y = 0;
            _.each(this.views, function(view, i) {
                // Container object
                var section = $("<div>", {
                    'class': 'grid-section',
                    'css': {
                        'left': (x * sectionWidth)+"%",
                        'top': (y * sectionHeight)+"%",
                        'width': sectionWidth+"%",
                        'height': sectionHeight+"%"
                    }
                });
                section.appendTo(this.$el);

                // Resize bar
                if (x < (nColumns - 1)) {
                    // Horrizontal
                    var hBar = $("<div>", {
                        'class': "grid-resize-bar-h"
                    });
                    hBar.appendTo(section);
                }

                if (y < (nLines - 1)) {
                    // Vertical
                    var vBar = $("<div>", {
                        'class': "grid-resize-bar-v"
                    });
                    vBar.appendTo(section);
                }


                 // Calcul next position
                x = x + 1;
                if (x >= nColumns) {
                    x = 0;
                    y = y + 1;
                }
            }, this);

            return this.ready();
        },

        
    });

    return GridView;
});