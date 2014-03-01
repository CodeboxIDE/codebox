define([
    'hr/hr',
    'hr/dom'
], function (hr, $) {
    var DropArea = hr.Class.extend({
        defaults: {
            // View for this area
            view: null,

            // Class when drop data
            className: "dragover",

            // Draggable type
            dragType: null,

            // Handler for drop
            handler: null
        },

        initialize: function() {
            DropArea.__super__.initialize.apply(this, arguments);
            var that = this;

            this.view = this.options.view;
            this.$el = this.view.$el;

            this.dragType = this.options.dragType;

            this.$el.on('mouseenter', function(e) {
                if (that.dragType.isDragging()) {
                    that.dragType.enterDropArea(that);
                    that.$el.addClass("dragover");
                }
            });

            this.$el.on('mouseleave', function(e) {
                that.$el.removeClass("dragover");
            });

            this.on("drop", function() {
                that.$el.removeClass("dragover");
            });

            if (this.options.handler) this.on("drop", this.options.handler);
        }
    });

    var DraggableType = hr.Class.extend({
        initialize: function() {
            DraggableType.__super__.initialize.apply(this, arguments);

            // Data transfered
            this.data = null;

            // Drop handler
            this.drop = null;
        },

        // Is currently dragging data
        isDragging: function() {
            return this.data != null;
        },

        // Enter drop area
        enterDropArea: function(area) {
            this.drop = area;
        },

        // Exit drop area
        exitDropArea: function() {
            this.drop = null;
        },

        // Enable drag and drop in a object
        enableDrag: function(options) {
            var that = this, $document = $(document), $el, data;

            options = _.defaults(options || {}, {
                // View to drag
                view: null,

                // Element to drag
                el: null,

                // Data to transfer
                data: null
            });
            if (options.el) $el = $(options.el);
            if (options.view) $el = options.view.$el, data = options.view;
            if (options.data) data = options.data;

            $el.mousedown(function(e) {
                e.preventDefault();
                var dx, dy;
                var oX = e.pageX;
                var oY = e.pageY;
                var poX = $el.offset().left;
                var poY = $el.offset().top;

                that.data = data;

                var f = function(e) {
                    dx = oX - e.pageX;
                    dy = oY - e.pageY;

                    $el.addClass("move");
                    $el.css({
                        'left': poX-dx,
                        'top': poY
                    });

                    if (Math.abs(dy) > 50) {
                        $el.css({
                            'top': poY-dy
                        });
                    }
                };

                $document.mousemove(f);
                $document.mouseup(function(e) {
                    if (that.drop) {
                        that.drop.trigger("drop", that.data);
                    }

                    that.data = null;
                    that.drop = null;

                    $el.removeClass("move");
                    $el.css({
                        'left': "auto",
                        'top': "auto"
                    });
                    $document.unbind('mousemove', f);
                });
            });
        }
    });

    return {
        DropArea: DropArea,
        DraggableType: DraggableType
    };
});