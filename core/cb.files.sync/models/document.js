// Requires
var Q = require('q');
var _ = require('underscore');

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Diff = require('googlediff');
var diff = new Diff();

var md5 = require('../utils').md5;

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
    var currentHash = md5(this.buffer);

    // Fail if different base
    if(currentHash != preHash) {
        return false;
    }

    // Do patching
    var patch = diff.patch_fromText(patchText);

    // Update buffer
    this.buffer = diff.patch_apply(patch, this.buffer)[0];

    return true;
};

Document.prototype.read = function() {
    return Q.nfbind(this.service.invoke)('read', this.path, this.creatorId);
};

Document.prototype.write = function(content) {
    return Q.nfbind(this.service.invoke)('write', this.path, content, this.creatorId);
};

Document.prototype.save = function() {
    return this.write(this.buffer);
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