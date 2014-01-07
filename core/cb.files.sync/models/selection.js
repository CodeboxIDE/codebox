// Requires
var Cursor = require('./cursor').Cursor;


function Selection(sx, sy, ex, ey) {
    this.start = new Cursor(sx, sy);
    this.end = new Cursor(ex, ey);
}

// Exports
exports.Selection = Selection;