define([], function() {
    var app = codebox.require("core/app");
    var box = codebox.require("core/box");
    var menu = codebox.require("core/commands/menu");
    var commands = codebox.require("core/commands/toolbar");
    var hr = codebox.require("hr/hr");
    var Command = codebox.require("models/command");
    var localfs = codebox.require("core/localfs")


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
            'title': "Run Synchronization",
            'offline': false,
            'icon': "refresh",
            'action': function() {
                return localfs.sync();
            }
        },
        {
            'title': "Reset Offline Cache",
            'offline': false,
            'icon': "refresh",
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
    
    // Run sync every 5min
    setInterval(function() {
        localfs.autoSync();
    }, 5*60*1000);

    // Run sync everytime there is a modification
    box.on("box:watch", function() {
        localfs.autoSync();
    });

    setTimeout(function() {
        // Run sync
        localfs.sync();
    }, 30*1000);
});

