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
            handler: null,

            // Contrain elastic
            constrain: null
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
                that.dragType.exitDropArea();
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
                data: null,

                // Base drop area
                baseDropArea: null
            });
            if (options.el) $el = $(options.el);
            if (options.view) $el = options.view.$el, data = options.view;
            if (options.data) data = options.data;

            $el.mousedown(function(e) {
                e.preventDefault();
                var dx, dy, hasMove = false;

                // origin mouse
                var oX = e.pageX;
                var oY = e.pageY;

                // origin element
                var poX = $el.offset().left;
                var poY = $el.offset().top;

                // element new position
                var ex, ey, ew, eh;
                ew = $el.width();
                eh = $el.height();

                // Contrain element
                var cw, ch, cx, cy;

                that.drop = options.baseDropArea;
                that.data = data;

                var f = function(e) {
                    dx = oX - e.pageX;
                    dy = oY - e.pageY;

                    if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
                        if (!hasMove) $el.addClass("move");
                        hasMove = true;
                    }

                    ex = poX - dx;
                    ey = poY - dy;

                    if (that.drop && that.drop.options.constrain) {
                        cw = that.drop.$el.width();
                        ch = that.drop.$el.height();
                        cx = that.drop.$el.offset().left;
                        cy = that.drop.$el.offset().top;

                        if (Math.abs(ey - cy) < 50) ey = cy;
                        if (Math.abs((ey + eh) - (cy+ch)) < 50) ey = cy + ch - eh;
                        if (Math.abs(ex - cx) < 50) ex = cx;
                        if (Math.abs((ex + ew) - (cx+cw)) < 50) ex = cx + cw - ew;
                    }

                    $el.css({
                        'left': ex,
                        'top': ey
                    });
                };

                $document.mousemove(f);
                $document.one("mouseup", function(e) {
                    $document.unbind('mousemove', f);
                    
                    if (hasMove && (!options.baseDropArea || !that.drop || (options.baseDropArea.cid != that.drop.cid))) {
                        if (that.drop) {
                            that.drop.trigger("drop", that.data);
                        }
                        that.trigger("drop", that.drop, that.data);
                    }

                    that.data = null;
                    that.drop = null;

                    $el.removeClass("move");
                    $el.css({
                        'left': "auto",
                        'top': "auto"
                    });
                });
            });
        }
    });

    return {
        DropArea: DropArea,
        DraggableType: DraggableType
    };
});