// Requires
var SockJS = require("sockjs-stream");
var MuxDemux = require('mux-demux');
var es = require('event-stream');
//var pty = require('pty.js');

var WRAP = {
    wrapper: require('mux-demux/msgpack').wrap
};

// Input
var rows = process.stdout.rows;
var columns = process.stdout.columns;
var shellId =  process.argv[2] || '';

var href = 'ws://localhost:8000/stream/shells';

var mx = MuxDemux();
var shellStreams = SockJS(href);


// A stream for multiple shells
shellStreams.pipe(mx).pipe(shellStreams);

// A stream for a single shell
var shellStream = mx.createStream(shellId);
//var mmx = MuxDemux();

// Shell stream
//shellStream.pipe(mmx).pipe(shellStream);

// The PTY shell of the shell
//var rpc = mmx.createStream('rpc');
//var pty = mmx.createStream('pty');


var state = { meta: false };
var keyboard = es.through(function (buf) {
    if (buf.length === 1 && buf[0] === 1) return state.meta = true;

    if (state.meta && buf[0] === 'd'.charCodeAt(0)) {
        process.exit();
    }
    else this.queue(buf);
    state.meta = false;
});


var r = shellStream;
keyboard.pipe(r).pipe(process.stdout);

keyboard.write('ls');
process.stdin.setRawMode(true);
process.stdin.pipe(keyboard);

process.on('exit', function () {
    process.stdin.setRawMode(false);
    console.log('\n[shux exited]');
});


shellStreams.on('close', function() {
    console.error('ended unexpectedly');
    process.exit();
});
