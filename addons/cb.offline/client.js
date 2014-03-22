define([
    "settings",
    "menus"
], function(settings, menus) {
    var $ = codebox.require("hr/dom");
    var Q = codebox.require("hr/promise");
    var app = codebox.require("core/app");
    var box = codebox.require("core/box");
    var menu = codebox.require("core/commands/menu");
    var commands = codebox.require("core/commands/toolbar");
    var operations = codebox.require("core/operations");
    var hr = codebox.require("hr/hr");
    var Command = codebox.require("models/command");
    var localfs = codebox.require("core/localfs");

    var _syncInterval = null;


    // Run offline cache update operation
    var op = operations.start("offline.update", null, {
        'title': "Updating",
        'icons': {
            'default': "fa-cog fa-spin",
        },
        'state': window.applicationCache.status == window.applicationCache.IDLE ? "idle" : "running",
        'progress': 0
    });

    // Application manifest
    $(window.applicationCache).bind('downloading progress', function(e) {
        var progress = 0;
        if (e && e.originalEvent && e.originalEvent.lengthComputable) {
            progress = Math.round(100*e.originalEvent.loaded/e.originalEvent.total);
        }
        op.state("running");
        op.progress(progress);
    });
    $(window.applicationCache).bind('checking', function(e) {
        op.state("running");
        op.progress(0);
    });
    $(window.applicationCache).bind('noupdate cached obsolete error', function(e) {
        op.state("idle");
    });


    // Update settings
    var updateSettings = function() {
        var enabled = settings.user.get("enabled", true);
        if (_syncInterval) clearInterval(_syncInterval);

        // Enable sync
        localfs.enableSync(settings.user.get("enabled", true));

        // Set ignored files
        localfs.setIgnoredFiles(settings.user.get("syncIgnore", "").split("\n"));

        // Toggle menu
        menus.sync.toggleFlag("hidden", !enabled);
        
        // Run sync every 10min
        _syncInterval = setInterval(function() {
            localfs.autoSync();
        }, settings.user.get("syncInterval", 10)*60*1000);
    };  

    setTimeout(function() {
        localfs.sync();
    }, 5*1000);

    // Run sync everytime there is a modification
    box.on("box:watch", function() {
        localfs.autoSync();
    });

    // Change settings
    settings.user.change(updateSettings);
    updateSettings();
});

