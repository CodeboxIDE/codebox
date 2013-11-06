define([
    "views/box",
    "less!stylesheets/chat.less"
], function(ChatBoxView) {
    var hr = require("hr/hr");
    var user = require("core/user");

    var ChatView = hr.View.extend({
        className: "addon-chat",
        events: {
            
        },

        // Constructor
        initialize: function() {
            ChatView.__super__.initialize.apply(this, arguments);
            this.boxes = {};
        },

        // Render
        render: function() {
            return this.ready();   
        },

        // Open a new box
        open: function(boxId, boxTitle) {
            if (!this.boxes[boxId]) {
                this.boxes[boxId] = new ChatBoxView({
                    'to': boxId,
                    'title': boxTitle
                });
                this.boxes[boxId].on("close", function() {
                    delete this.boxes[boxId];
                    this._calculBoxesPositions();
                }, this);
                this.boxes[boxId].$el.appendTo(this.$el);
                this.boxes[boxId].render();
                this._calculBoxesPositions();
            }

            this.boxes[boxId].toggle(true);
            return this.boxes[boxId];
        },

        // Calcul positions of boxes
        _calculBoxesPositions: function() {
            var i = 0;
            _.each(this.boxes, function(box, boxId) {
                box.$el.css("right", 10 + i * (240+10));
                i = i + 1;
            }, this);
            return this;
        },
    });

    return ChatView;
});