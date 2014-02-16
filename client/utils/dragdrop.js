define([
    'hr/dom'
], function ($) {
    var DragDrop = {
        /*
         *  Init drag on a event
         *  @e : dom event
         *  @effect : effect allowed : copy, ...
         */
        drag: function(e, effect) {
            if (e != null) {
                var ev = e.originalEvent;
                ev.dataTransfer.effectAllowed = effect;
                return true;
            } else {
                return false;
            }
        },

        /*
         *  Check drag is gogod for droping
         *  @e : dom event
         *  @attr : data require
         */
        checkDrop: function(e, attr) {
            return _.contains(e.originalEvent.dataTransfer.types, attr);
        },

        /*
         *  Init dragover on a event
         *  @e : dom event
         *  @effect : effect allowed : copy, ...
         */
        dragover: function(e, effect) {
            if (e != null) {
                var ev = e.originalEvent;
                if (ev.preventDefault) ev.preventDefault();
                ev.dataTransfer.dropEffect = effect;
                return true;
            } else {
                return false;
            }
        },

        /*
         *  Init drop event
         *  @e : dom event
         */
        drop: function(e, effect) {
            if (e != null) {
                var ev = e.originalEvent;
                if (ev.stopPropagation) ev.stopPropagation();
                return true;
            } else {
                return false;
            }
        },

        /*
         *  Define drag data
         *  @e : dom event
         *  @attr : name of the data
         *  @data : data
         */
        setData: function(e, attr, data) {
            if (e != null) {
                var ev = e.originalEvent;
                ev.dataTransfer.setData(attr, JSON.stringify(data));
                return true;
            } else {
                return false;
            }
        },

        /*
         *  Get drag data
         *  @e : dom event
         *  @attr : name of the data
         */
        getData: function(e, attr) {
            if (e != null) {
                var ev = e.originalEvent;
                var o = ev.dataTransfer.getData(attr);
                if (o == null) {
                    return null;
                }
                try {
                    var obj = JSON.parse(o);
                    return obj;
                } catch(err) {
                    return null;
                } 
            } else {
                return null;
            }
        },
    };
    return DragDrop;
});