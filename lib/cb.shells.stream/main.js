// Requires
var Q = require('Q');
var _ = require('underscore');

var shoe = require('shoe');
var es = require('event-stream')
var MuxDemux = require('mux-demux');

var Shell = require('./shell').Shell;


var WRAP = _.identity || require('mux-demux/msgpack').wrap;


function ShellSocketManager(manager) {
    this.manager = manager;

    _.bindAll(this);
}

ShellSocketManager.prototype.handleStream = function(stream) {
    // Input data
    var manager = this.manager;
    var shellId = stream.meta;

    // Streams to obtain
    var streams =  {};

    var shell = (new Shell(
        manager,
        shellId,
        streams.rpc,
        stream
    ))
    .init()
    .then(function(shell) {
        console.log('created shell =', shell);
    });

    /*
    stream.pipe(WRAP(MuxDemux(function(subStream) {
        streams[subStream.meta] = subStream;

        // Now open shell
        if(streams.rpc && streams.pty) {
            // Create shell
            var shell = (new Shell(
                manager,
                shellId,
                streams.rpc,
                streams.pty
            ))
            .init()
            .then(function(shell) {
                console.log('created shell =', shell);
            });
        }

        return subStream;
    }))).pipe(stream);
    */

    stream.on('error', function(error) {
        console.error(error);
        console.error(error.stack);
    });

    return stream;
};

ShellSocketManager.prototype.handleSocket = function(socket) {
    // MuxDemux this sockets to support multiple shells
    // over the same socket
    socket.pipe(WRAP(MuxDemux(this.handleStream))).pipe(socket);
};



function setup(options, imports, register) {
    // Import
    var shellManager = imports.shells.manager;
    var server = imports.server.http;

    var socketManager = new ShellSocketManager(shellManager);

    // Construct
    shoe(socketManager.handleSocket).install(server, '/stream/shells');

    // Register
    register(null, {});
}

// Exports
module.exports = setup;
