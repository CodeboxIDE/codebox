var Q = require('q');
var fs = require('fs');
var ini = require('ini');


function readGitConfig(filename) {
    return Q.nfcall(fs.readFile, filename, 'utf8')
    .then(ini.parse);
}

module.exports = readGitConfig;
