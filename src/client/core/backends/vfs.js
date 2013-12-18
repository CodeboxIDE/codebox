define([
    'hr/hr'
], function(hr) {
    var vfs = new hr.Backend({
        prefix: "vfs"
    });

    return vfs;
});