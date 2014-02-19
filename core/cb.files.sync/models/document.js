// Requires
var Q = require('q');
var _ = require('underscore');

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Diff = require('googlediff');
var diff = new Diff();

var hash = require('../utils').hash;

function Document(path, creatorId, service) {
    this.path = path;
    this.buffer = '';
    this.creatorId = creatorId;
    this.service = service;
}

Document.prototype.getContent = function() {
    return this.buffer;
};

Document.prototype.patch = function(patchText, preHash, postHash) {
    var currentHash = hash(this.buffer);

    // Fail if different base
    if(currentHash != preHash) {
        return null;
    }

    // Do patching
    var patch = diff.patch_fromText(patchText);

    // Update buffer
    var oldBuffer = this.buffer;
    this.buffer = diff.patch_apply(patch, this.buffer)[0];

    return oldBuffer != this.buffer;
};

Document.prototype.read = function() {
    if (!this.path) {
        return Q("");
    }
    return Q.nfbind(this.service.invoke)('read', this.path, this.creatorId);
};

Document.prototype.write = function(content) {
    if (!this.path) {
        return Q(null);
    }
    return Q.nfbind(this.service.invoke)('write', this.path, content, this.creatorId);
};

Document.prototype.save = function() {
    return this.write(this.buffer);
};

Document.prototype.setPath = function(path) {
    this.path = path;
};

Document.prototype.load = function() {
    var that = this;
    return this.read()
    .then(function(data) {
        that.buffer = data;
        return data;
    });
};

// Exports
exports.Document = Document;