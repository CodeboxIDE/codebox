define([], function() {
    var $ = codebox.require("jQuery");
    var Q = codebox.require("q");
    var app = codebox.require("core/app");
    var box = codebox.require("core/box");
    var menu = codebox.require("core/commands/menu");
    var commands = codebox.require("core/commands/toolbar");
    var operations = codebox.require("core/operations");
    var hr = codebox.require("hr/hr");
    var Command = codebox.require("models/command");
    var localfs = codebox.require("core/localfs");
    var dialogs = codebox.require("utils/dialogs");

    // Command to check connexion
    var checkConnexion = commands.register("offline.check", {
        'title': "Check Connexion",
        'offline': true,
        'icon': "bolt"
    }, function() {
        hr.Offline.check();
    });

    // Menu Synchronize  list
    var menuListChanges = new Command({}, {
        'title': "Changes",
        'type': "menu",
        'flags': "disabled"
    });
    var menuChanges = menu.register("offline.synchronize", {
        title: "Synchronize",
        position: 95,
        offline: false
    }).menuSection(checkConnexion)
    .menuSection([
        {
            'title': "Calcul Changes",
            'offline': false,
            'action': function() {
                return localfs.sync();
            }
        }
    ]).menuSection([
        {
            'title': "Reset All Changes",
            'offline': false,
            'action': function() {
                return localfs.reset();
            }
        },
        {
            'title': "Apply All Changes",
            'offline': false,
            'action': function() {
                var n = localfs.changes.size();
                if (n == 0) return;

                dialogs.confirm("Do you really want to apply "+n+" changes?").then(function(yes) {
                    if (!yes) return;
                    return localfs.changes.applyAll();
                });   
            }
        }
    ]).menuSection([
        menuListChanges
    ]);

    // Changes update
    localfs.changes.on("add remove reset", function() {
        menuListChanges.toggleFlag("disabled", localfs.changes.size() == 0);
        menuListChanges.menu.reset(localfs.changes.map(function(change) {
            return change.command();
        }));
    });

    // Run offline cache update operation
    var op = operations.start("offline.update", null, {
        'title': "Downloading new version",
        'icon': "fa-download",
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

    // Add menu when offline
    menu.register("offline", {
        title: "Offline",
        position: 90,
        offline: true
    }).menuSection([
        checkConnexion
    ]);

    // Enable sync
    localfs.enableSync();
    
    // Run sync every 10min
    setInterval(function() {
        localfs.autoSync();
    }, 10*60*1000);

    // Run sync everytime there is a modification
    box.on("box:watch", function() {
        localfs.autoSync();
    });

    setTimeout(function() {
        // Run sync
        localfs.sync();
    }, 5*1000);
});

