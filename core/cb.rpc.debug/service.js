// Requires
var Q = require('q');
var _ = require('lodash');
var path = require('path');
var bugs = require('bugs');

var debuggers = {
    // Python
    "pdb": ["py"],

    // Native
    "gdb": ["o"],

    // Still unstable
    /*
    // Java
    "jdb": ["java"],

    // Ruby
    "rdb": ["rb"]*/
};

function DebugRPCService(workspace, events) {
    this.workspace = workspace;
    this.events = events;

    this.dbgs = {};

    _.bindAll(this);
}

// Normalize an absolute path
DebugRPCService.prototype._normPath = function(_path) {
    if (_path.indexOf(this.workspace.root) == 0) _path = _path.replace(this.workspace.root, "");
    return _path;
};

// Get debugger
DebugRPCService.prototype._dbg = function(id) {
    if (!this.dbgs[id]) throw "No debugger associated with this id";
    return this.dbgs[id];
};

// Prepare the debugger
DebugRPCService.prototype.init = function(args, meta) {
    var that = this;
    if (!args.path) throw "Need 'tool' and 'path' arguments";

    // Auto choice debugger
    if (!args.tool) {
        var ext = args.path.split('.').pop();
        args.tool = _.chain(debuggers)
        .pairs()
        .find(function(d) {
            return _.contains(d[1], ext)
        })
        .value();
        args.tool = args.tool ? args.tool[0] : null;
    }

    // Check debugger is valide
    if (!_.contains(_.keys(debuggers), args.tool)) throw "Invalid debugger";

    args.id = args.id || _.uniqueId("debugger");

    if (this.dbgs[args.id]) throw "This debugger already exists";

    // Create debugger interface
    this.dbgs[args.id] = bugs[args.tool](
        path.join(this.workspace.root, args.path)
    );

    // Signal it
    this.events.emit('debug.init', {
        'id': args.id,
        'path': args.path,
        'userId': meta.user.userId
    });

    // Bind events
    this.dbgs[args.id].runner.on('update', function() {
        that.events.emit('debug.update', {
            'id': args.id,
            'path': args.path
        });
    });

    return this.dbgs[args.id].init()
    // Add breakpoints
    .then(function() {
        return Q.all(
            _.chain(args.breakpoints || {})
            .map(function(lines, path) {
                return _.map(lines, function(line) {
                    return {
                        'line': line,
                        'path': path
                    };
                })
            })
            .flatten()
            .map(function(point) {
                return that.dbgs[args.id].break(path.join(that.workspace.root, point.path), point.line)
                .fail(function() {
                    return Q();
                })
            })
            .value()
        );
    })
    // Return
    .then(function() {
        return {
            'id': args.id
        };
    });
};

// Close a debugger
DebugRPCService.prototype.close = function(args, meta) {
    var that = this;

    // Kill debugger
    return this._dbg(args.id).kill()
    .then(function() {

        // remove debugger session
        delete that.dbgs[args.id];
        return {};
    });
};

// Start the debugger
DebugRPCService.prototype.start = function(args, meta) {
    return this._dbg(args.id).start(args.arg || "");
};

// Stop the debugger
DebugRPCService.prototype.stop = function(args, meta) {
    return this._dbg(args.id).stop();
};

// Next
DebugRPCService.prototype.next = function(args, meta) {
    return this._dbg(args.id).next();
};

// Continue
DebugRPCService.prototype.cont = function(args, meta) {
    return this._dbg(args.id).continue();
};

// Restart the debugger
DebugRPCService.prototype.restart = function(args, meta) {
    return this._dbg(args.id).restart();
};

// Add breakpoint
DebugRPCService.prototype.breakpoint_add = function(args, meta) {
    if (!args.line || !args.path) throw "Need 'line' and 'path' arguments";
    
    return this._dbg(args.id).break(path.join(this.workspace.root, args.path), args.line);
};


// Remove breakpoint
DebugRPCService.prototype.breakpoint_clear = function(args, meta) {
    if (!args.num) throw "Need 'num' argument";
    
    return this._dbg(args.id).clear(args.num);
};

// Get locals
DebugRPCService.prototype.locals = function(args, meta) {
    return this._dbg(args.id).locals();
};

// Eval code
DebugRPCService.prototype.eval = function(args, meta) {
    if (!args.code) throw "Need 'code' arguments";

    return this._dbg(args.id).eval(args.code);
};

// Get breakpoints
DebugRPCService.prototype.breakpoints = function(args, meta) {
    var that = this;

    return this._dbg(args.id).breakpoints()
    .then(function(breakpoints) {
        return _.map(breakpoints, function(breakpoint) {
            return {
                'num': breakpoint.num,
                'filename': that._normPath(breakpoint.location.filename),
                'line': breakpoint.location.line
            }
        });
    });
};

// Get backtrace
DebugRPCService.prototype.backtrace = function(args, meta) {
    var that = this;

    return this._dbg(args.id).backtrace()
    .then(function(stack) {
        return _.map(stack, function(item) {
            return {
                'filename': that._normPath(item.filename),
                'line': item.line
            }
        });
    });
};


// Exports
exports.DebugRPCService = DebugRPCService;
