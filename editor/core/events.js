define([
    "hr/hr",
    "core/socket"
], function(hr, Socket) {
    var logging = hr.Logger.addNamespace("events");

    var events = new Socket({
        service: "events"
    });

    events.on("message", function(e) {
        events.trigger("e:"+e.event.replace(/\./g, ":"), e.data);
    });

    return events;
});