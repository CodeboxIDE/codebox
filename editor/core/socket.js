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
                var data = JSON.parse(e.data);

                that.trigger('data', data);
                if (data.method) {
                    that.trigger('do:'+data.method, data.data || {});
                }
            };
            this.sock.onclose = function() {
                that.trigger("close");
            };
        },

        // Send a message
        send: function(message) {
            this.sock.send(JSON.stringify(message));
            return this;
        },

        // Call a method
        do: function(method, data) {
            return this.send({
                'method': method,
                'data': data
            });
        },

        // Close the connection
        close: function() {
            this.sock.close();
            return this;
        }
    });

    return Socket;
});