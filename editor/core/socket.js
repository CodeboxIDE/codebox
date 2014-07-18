define([
    "hr/hr",
    "sockjs"
], function(hr, sockjs) {
    var logging = hr.Logger.addNamespace("socket");

    var Socket = hr.Class.extend({
        initialize: function() {
            var that = this;
            Socket.__super__.initialize.apply(this, arguments);

            logging.log("connecting to service", this.options.service);
            this.sock = new SockJS(window.location.origin+window.location.pathname+"socket/"+this.options.service);
            this.sock.onopen = function() {
                that.trigger("open");
            };
            this.sock.onmessage = function(e) {
                that.trigger('message', e.data);
            };
            this.sock.onclose = function() {
                that.trigger("close");
            };
        },

        // Send a message
        send: function(message) {
            this.sock.send(message);
            return this;
        },

        // Close the connection
        close: function() {
            this.sock.close();
            return this;
        }
    });

    return Socket;
});