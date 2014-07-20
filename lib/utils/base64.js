var btoa = function(s) {
    return (new Buffer(s)).toString('base64');
};

var atob = function(s) {
    return (new Buffer(s, 'base64')).toString('utf8');
};

module.exports = {
    btoa: btoa,
    atob: atob
};
