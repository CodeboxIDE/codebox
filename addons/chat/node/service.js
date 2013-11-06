// Requires
var Q = require('q');
var _ = require('underscore');

function ChatRPCService(events, logger) {
    this.events = events;
    this.logger = logger;

    _.bindAll(this);
}

// Send a message
ChatRPCService.prototype.send = function(args, meta) {
    if (!args.message) {
        return Q.reject(new Error("Need 'message' to post"));
    }
    var message = {
        'content': args.message,
        'to': args.to || "all",
        'from': {
            'name': meta.user.name,
            'userId': meta.user.userId
        }
    };
    this.events.emit("chat.message", message);
    return Q(message);
};

// Exports
exports.ChatRPCService = ChatRPCService;
