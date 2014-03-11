// Requires
var Q = require('q');
var _ = require('lodash');
var path = require('path');
var bugs = require('bugs');

var debuggers = [
    "pdb", "gdb", "jdb", "rdb"
];

function DebugRPCService(workspace, events) {
    this.workspace = workspace;
    this.events = events;

    this.dbg = null;

    _.bindAll(this);
}

// Prepare the debugger
DebugRPCService.prototype.init = function(args, meta) {
    if (!args.tool || !args.path) throw "Need 'tool' and 'path' arguments";
    if (!_.contains(debuggers, args.tool)) throw "Invalid debugger";

    // Create debugger interface
    this.dbg = bugs[args.tool](
        path.join(this.workspace.root, args.path)
    );

    // Signal it
    this.events.emit('debug.init', {
        userId: meta.user.userId
    });

    return this.dbg.init()
    .then(function() {
        return {};
    });
};

// Add breakpoint
DebugRPCService.prototype.breakpoint_add = function(args, meta) {
    if (!args.line || !args.path) throw "Need 'line' and 'path' arguments";
    if (!this.dbg) throw "No active debugger";
    
    return this.dbg.break(path.join(this.workspace.root, args.path), args.line);
};


// Remove breakpoint
DebugRPCService.prototype.breakpoint_delete = function(args, meta) {
    if (!args.id) throw "Need 'id' argument";
    if (!this.dbg) throw "No active debugger";
    
    return this.dbg.delete(args.id);
};

// Get locals
DebugRPCService.prototype.locals = function(args, meta) {
    if (!this.dbg) throw "No active debugger";

    return this.dbg.locals();
};

// Get breakpoints
DebugRPCService.prototype.breakpoints = function(args, meta) {
    if (!this.dbg) throw "No active debugger";

    return this.dbg.breakpoints();
};

// Get backtrace
DebugRPCService.prototype.backtrace = function(args, meta) {
    if (!this.dbg) throw "No active debugger";

    return this.dbg.backtrace();
};


// Exports
exports.DebugRPCService = DebugRPCService;
