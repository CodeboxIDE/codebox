var es = require('event-stream');
var MuxDemux = require('mux-demux');
var net = require('net');

var PORT = 8642;

function openShell(id, multiplexer) {
    var shellStream = multiplexer.createStream(id);
    var mmx = MuxDemux();

    shellStream.pipe(mmx).pipe(shellStream);

    var otherStream = mmx.createStream('other');

    otherStream.write('heelo !!!');

    es.pipeline(
        otherStream,
        es.map(function(data, cb) {
            cb(null, "### "+data+'\n');
        })
    ).pipe(process.stderr);
}

function clientCall() {
    var con = net.connect(PORT), mx = MuxDemux();

    // Pipe
    con.pipe(mx).pipe(con);

    openShell('xxy', mx);
    openShell('123456', mx);
    openShell('123457', mx);
}

function handleStream(stream, metaId) {
    console.log('Got subStream');
    stream.pipe(MuxDemux(function(subStream) {
        console.log('got sub sub stream');
        // Data handler
        subStream.on('data', function(data) {
            console.log(metaId, ':', subStream.meta, ':', data);
        });

        subStream.write('Roger that '+metaId+'/'+subStream.meta);
    })).pipe(stream);
}


var server = net.createServer(function (con) {
    console.log('got raw socket connection');
    con.pipe(MuxDemux(function (stream) {
        console.log('Got MuxDemux connection');
        handleStream(stream, stream.meta);
    })).pipe(con);
});

server.listen(PORT, clientCall);