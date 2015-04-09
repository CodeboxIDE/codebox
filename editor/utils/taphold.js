var $ = require("jquery");

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
        var maxMove = 5;
        var oX, oY;

        // mousemove or touchmove callback
        function mousemove_callback(e) {
            var x  = e.pageX || e.originalEvent.touches[0].pageX;
            var y  = e.pageY || e.originalEvent.touches[0].pageY;

            if (Math.abs(oX - x) > maxMove || Math.abs(oY - y) > maxMove) {
                if (timeout) clearTimeout(timeout);
            }
        }

        // mouseup or touchend callback
        function mouseup_callback(e) {
            unbindDoc();
            if (timeout) clearTimeout(timeout);
        }

        var bindDoc = function() {
            $document.on('mousemove', mousemove_callback);
            $document.on('touchmove', mousemove_callback);
            $document.on('mouseup', mouseup_callback);
            $document.on('touchend', mouseup_callback);
        }

        var unbindDoc = function() {
            $document.unbind('mousemove', mousemove_callback);
            $document.unbind('touchmove', mousemove_callback);
            $document.unbind('mouseup', mouseup_callback);
            $document.unbind('touchend', mouseup_callback);
        }

        // mousedown or touchstart callback
        function mousedown_callback(e) {
            // Only accept left click
            if (e.type == 'mousedown' && e.originalEvent.button != 0) return;
            oX = e.pageX || e.originalEvent.touches[0].pageX;
            oY = e.pageY || e.originalEvent.touches[0].pageY;

            bindDoc();

            // set a timeout to call the longpress callback when time elapses
            timeout = setTimeout(function() {
                unbindDoc();

                triggerCustomEvent(thisObject, "taphold", $.Event( "taphold", {
                    target: e.target,
                    pageX: oX,
                    pageY: oY
                } ));
            }, duration);

            e.stopPropagation();
        }

        // Browser Support
        $this.on('mousedown', mousedown_callback);

        // Mobile Support
        $this.on('touchstart', mousedown_callback);
    },
    teardown: function(namespaces){
        $(this).unbind(namespaces)
    }
};

module.exports = {
    bind: function(el, fn ) {
        return el.bind("taphold", fn );
    },
    unbind: function() {
        return el.unbind("taphold");
    }
};
