var _ = require('underscore');
var es = require('event-stream');

// Globals
var shellIndex;
var currentShell;
var shells;

var SOURCE = es.duplex(process.stdin, process.stdout);

var KEYS = {
    "27,91,68": 'left',
    "27,91,67": 'right'
};

var META_ACTIONS = {
    'left': function previousShell() {
        console.log('previous shell');
    },
    'right': function nextShell() {
        console.log('next shell');
    },
    'd': function exit() {
        console.log('Exiting !!!');
        process.exit();
    }
};

var state = { meta: false };
var keyboard = es.through(function (buf) {
    console.error(buf);

    if (buf.length === 1 && buf[0] === 1) return state.meta = true;

    if (state.meta) {
        var chrStr;

        // Get key value
        if(buf.length == 1) {
            chrStr = buf.toString();
        } else {
            chrStr = _.toArray(buf).join();
            chrStr = KEYS[chrStr] || chrStr;
        }

        (META_ACTIONS[chrStr] || _.identity)();
    }
    else this.queue(buf);
    state.meta = false;
});

function disconnectShell(shellStream, source) {
    return shellStream.unpipe(source).unpipe(shellStream);
}

function connectShell(shellStream, source) {
    return shellStream.pipe(source).pipe(source);
}

function switchShell(shellStream) {
    var connected = Boolean(currentShell);

    if() {
        disconnectShell()
    } else {

    }

    keyboard.pipe(shellStream);//.pipe(process.stdout);

    process.stdin.setRawMode(true);
    process.stdin.pipe(keyboard);

}

function openShell(shellId) {

}

function main() {
    var shellIds = _.range(3).map(String);
    var shells = _.map(shellIds, openShell);


    shells = {'1', '2', '3'};
    shellIndex = 1;
}


process.on('exit', function () {

    console.log();
});