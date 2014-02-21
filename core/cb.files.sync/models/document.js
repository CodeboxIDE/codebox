// Requires
var Q = require('q');
var _ = require('lodash');

var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Diff = require('googlediff');
var diff = new Diff();

var hash = require('../utils').hash;

function Document(path, creatorId, service, patcher) {
    this.path = path;
    this.buffer = '';
    this.creatorId = creatorId;
    this.service = service;

    this.patchQueue = [];
    this.patchingInProcess = false;
    this.patcher = patcher;
}

Document.prototype.getContent = function() {
    return this.buffer;
};

Document.prototype.patch = function(user, patchText, preHash, postHash) {
    if (this.patchingInProcess){
        this.patchQueue.push({
            'patch': patchText,
            'pre': preHash,
            'post': postHash
        });
        return;
    }
    this.patchingInProcess = true;

    var currentHash = hash(this.buffer);

    // Try apply patch
    var patch = diff.patch_fromText(patchText);
    var oldBuffer = this.buffer;

    var results = diff.patch_apply(patch, this.buffer);

    // Patch applied with success?
    if (results.length < 2 || 
    _.compact(results[1]).length != results[1].length) {
        console.log("Invalid application of ", patch, results);

        // clear queue
        this.patchQueue = [];
        this.patchingInProcess = false;

        // resync everybody
        return null;
    }

    var afterHash = hash(results[0]);
    if(currentHash != preHash) {
        console.log("!! content was different before");
    }
    if (afterHash != postHash) {
        console.log("!! content is different from expected");
    }

    // Update content
    this.buffer = results[0];

    // Send new patch to all the other
    this.patcher(user, patchText, hash(oldBuffer), hash(this.buffer));

    this.patchingInProcess = false;
    if (this.patchQueue.length > 0){
        var nextPatch = this.patchQueue.shift();
        return this.patch(nextPatch.patch, nextPatch.pre, nextPatch.post);
    }

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