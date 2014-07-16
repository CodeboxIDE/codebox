define([
    'hr/utils',
    'hr/hr',
    'hr/dom'
], function (_, hr, $) {
    // Events for tablet and desktop
    var events = {
        'start': "mousedown",
        'stop': "mouseup",
        'move': "mousemove",
        'enter': "mouseenter",
        'leave': "mouseleave"
    };

    if (navigator.userAgent.search('Mobile') > 0) {
        events = {
            'start': "touchstart",
            'stop': "touchend",
            'move': "touchmove",
            'enter': "touchenter",
            'leave': "touchleave"
        };
    }

    // Define cursor
    var storedStylesheet = null;
    var setCursor = function(cs) {
        // Reset cursor
        if (storedStylesheet) storedStylesheet.remove();
        storedStylesheet = null;

        // Set new cursor
        if (cs) storedStylesheet = $( "<style>*{ cursor: "+cs+" !important; }</style>" ).appendTo($("body"));
    };
    var resetCursor = _.partial(setCursor, null);

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

            // Constrain elastic
            constrain: null
        },

        initialize: function() {
            DropArea.__super__.initialize.apply(this, arguments);
            var that = this;

            this.view = this.options.view;
            this.$el = this.view.$el;

            this.dragType = this.options.dragType;

            this.$el.on(events["enter"], function(e) {
                if (that.dragType.isDragging()) {
                    e.stopPropagation();
                    that.dragType.enterDropArea(that);
                    that.$el.addClass("dragover");
                }
            });

            this.$el.on(events["leave"], function(e) {
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

            // State
            this.state = true;

            // Drop handler
            this.drop = [];
        },

        // Toggle enable/disable drag and drop
        toggle: function(st) {
            this.state = st;
            return this;
        },

        // Is currently dragging data
        isDragging: function() {
            return this.data != null;
        },

        // Get drop
        getDrop: function() {
            return (this.drop.length > 0)? this.drop[this.drop.length - 1] : null;
        },

        // Enter drop area
        enterDropArea: function(area) {
            //console.log("enter drop", this.drop.length, area.$el.get(0));
            this.drop.push(area);
        },

        // Exit drop area
        exitDropArea: function() {
            this.drop.pop();
            //console.log("exit drop", this.drop.length);
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
                baseDropArea: null,

                // Before dragging
                start: null,

                // Cursor
                cursor: "copy"
            });
            if (options.el) $el = $(options.el);
            if (options.view) $el = options.view.$el, data = options.view;
            if (options.data) data = options.data;

            $el.on(events["start"], function(e) {
                if (e.type == 'mousedown' && e.originalEvent.button != 0) return;
                if (!that.state) return;
                e.preventDefault();
                e.stopPropagation();

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

                // Constrain element
                var cw, ch, cx, cy;

                if (options.start && options.start() === false) return;

                that.drop = [];
                if (options.baseDropArea) that.enterDropArea(options.baseDropArea);
                that.data = data;

                var f = function(e) {
                    var _drop = that.getDrop();

                    dx = oX - e.pageX;
                    dy = oY - e.pageY;

                    if (Math.abs(dx) > 20 || Math.abs(dy) > 20) {
                        if (!hasMove) {
                            setCursor(options.cursor);
                            $el.addClass("move");
                            that.trigger("drag:start");
                        }
                        hasMove = true;
                    } else {
                        return;
                    }

                    ex = poX - dx;
                    ey = poY - dy;

                    if (_drop && _drop.options.constrain) {
                        cw = _drop.$el.width();
                        ch = _drop.$el.height();
                        cx = _drop.$el.offset().left;
                        cy = _drop.$el.offset().top;

                        console.log("constrain", cx, cy, cw, ch)

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

                $document.on(events["move"], f);
                $document.one(events["stop"], function(e) {
                    $document.unbind(events["move"], f);
                    resetCursor();

                    var _drop = that.getDrop();

                    if (hasMove && (!options.baseDropArea || !_drop || (options.baseDropArea.cid != _drop.cid))) {
                        if (_drop) {
                            _drop.trigger("drop", that.data);
                        }
                        that.trigger("drop", _drop, that.data);
                    }

                    that.trigger("drag:end");

                    that.data = null;
                    that.drop = [];

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
        events: events,
        cursor: {
            set: setCursor,
            reset: resetCursor
        },
        DropArea: DropArea,
        DraggableType: DraggableType
    };
});