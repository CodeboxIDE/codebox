define([], function() {
    var app = codebox.require("core/app");
    var box = codebox.require("core/box");
    var menu = codebox.require("core/commands/menu");
    var commands = codebox.require("core/commands/toolbar");
    var hr = codebox.require("hr/hr");
    var Command = codebox.require("models/command");
    var localfs = codebox.require("core/localfs");
    var dialogs = codebox.require("utils/dialogs");

    // Menu changes list
    var menuListChanges = new Command({}, {
        'title': "Changes",
        'type': "menu",
        'flags': "disabled"
    });
    var menuChanges = menu.register("offline.changes", {
        title: "Changes",
        position: 95,
        offline: false
    }).menuSection([
        {
            'title': "Recalcul Changes",
            'offline': false,
            'action': function() {
                return localfs.sync();
            }
        },
        {
            'id': "changes.apply",
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


    // Command to check connexion
    var checkConnexion = commands.register("offline.check", {
        'title': "Check Connexion",
        'offline': true,
        'icon': "bolt"
    }, function() {
        hr.Offline.check();
    });

    var syncMenu = Command.register("offline.sync.menu", {
        'type': "menu",
        'title': "Synchronize"
    });
    syncMenu.menuSection(checkConnexion);
    syncMenu.menuSection([
        {
            'id': "changes.calcul",
            'title': "Calcul Changes",
            'offline': false,
            'action': function() {
                return localfs.sync();
            }
        },
        {
            'id': "changes.reset",
            'title': "Reset Offline Cache",
            'offline': false,
            'action': function() {
                return localfs.reset();
            }
        }
    ])


    // Add sync submenu
    menu.getById("file").menuSection([
        syncMenu
    ], {
        'position': 10
    });

    // Add menu when offline
    menu.register("offline", {
        title: "Offline",
        position: 90,
        offline: true
    }).menuSection([
        checkConnexion
    ]);
    
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

