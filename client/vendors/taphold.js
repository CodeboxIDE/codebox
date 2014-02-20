(function($) {
    var $document = $(document);

    function triggerCustomEvent( obj, eventType, event, bubble ) {
        var originalType = event.type;
        event.type = eventType;
        if ( bubble ) {
            $.event.trigger( event, undefined, obj );
        } else {
            $.event.dispatch.call( obj, event );
        }
        event.type = originalType;
    }

    $.event.special.taphold = {
        setup: function(data, namespaces){
            var thisObject = this,
                $this = $( thisObject );
            var timeout = null;
            var duration = 500;

            // mousedown or touchstart callback
            function mousedown_callback(e) {
                // Only accept left click
                if (e.type == 'mousedown' && e.originalEvent.button != 0) return;

                // set a timeout to call the longpress callback when time elapses
                timeout = setTimeout(function() {
                    triggerCustomEvent(thisObject, "taphold", $.Event( "taphold", {
                        target: e.target,
                        pageX: e.pageX || e.originalEvent.touches[0].pageX,
                        pageY: e.pageY || e.originalEvent.touches[0].pageY
                    } ));
                }, duration);

                e.stopPropagation();
            }

            // mouseup or touchend callback
            function mouseup_callback(e) {
                if (timeout) clearTimeout(timeout);
            };

            // Browser Support
            $this.on('mousedown', mousedown_callback);
            $this.on('mouseup', mouseup_callback);

            // Mobile Support
            $this.on('touchstart', mousedown_callback);
            $this.on('touchend', mouseup_callback);
        },
        teardown: function(namespaces){
            $(this).unbind(namespace)
        }
    };


    $.fn.taphold = function( fn ) {
        return fn ? this.bind("taphold", fn ) : this.trigger("taphold");
    };
}(jQuery));