var logger = require("hr.logger")("events");

var Socket = require("./socket");

// Create a socket connected to the events namespace from backend
var events = new Socket({
    service: "events"
});

events.on("do:report", function(e) {
    events.trigger("e:"+e.event, e.data);
});

module.exports = events;
