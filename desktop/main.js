// Requires
var gui = require('nw.gui');
var path = require('path');
var Q = require('q');
var _ = require('underscore');
var querystring = require("querystring");
var CodeboxIO = require('codebox-io').Client;


// Port allocation
var qClass = require('qpatch').qClass;
var harbor = qClass(require('harbor'));
var ports = new harbor(19000, 20000);

// DOM elements
var $directorySelector = $('#directory-selector');
var $projectList = $('#projects');
var $alert = $("#body .alert");
var $btnOpen = $("#open-new");
var $btnMenu = $("#open-menu");


// Local storage
var storageGet = function(key, def) {
    try {
        return JSON.parse(localStorage[key]);
    } catch(err) {
        return localStorage[key] || def;
    }
};
var storageSet = function(key, value) {
    localStorage[key] = JSON.stringify(value);
};

// Update codebox.io connexion
var updateRemote = function() {
    var boxes, key, token;
    token = storageGet("token");

    $alert.toggle(!token);
    if (!token) {
        boxes = [];
        storageSet("remoteBoxes", boxes);
        updateProjects();
    }

    var client = new CodeboxIO({
        'token': token
    });
    client.account().then(function(account) {
        storageSet("email", account.email);
        return client.boxes()
    }).then(function(_boxes) {
        boxes = _.map(_boxes, function(box) {
            return _.pick(box, "name", "url", "stack", "id", "public", "permissions");
        });
        storageSet("remoteBoxes", boxes);
        updateProjects();
    });
};

// Add project item
var addProjectItem = function(name, description, image, handler) {
    var $project = $("<li>", {
        'class': "project",
        'click': handler
    });
    $("<img>", {
        'src': image,
        'class': 'project-icon'
    }).appendTo($project);
    $("<p>", {
        'text': name,
        'class': 'project-title'
    }).appendTo($project);
    $("<p>", {
        'text': description,
        'class': 'project-path'
    }).appendTo($project);

    $projectList.append($project);
};

// Update list of projects
var updateProjects = function() {
    var projects = storageGet("projects", []);
    $projectList.empty();

    // Add remote boxes
    var boxes = storageGet("remoteBoxes", []);
    boxes.forEach(function(box) {
        addProjectItem(box.name, "remote - "+box.stack, "icons/128.png", function() {
            runRemoveCodebox(box);
        });
    });
    if (boxes.length > 0) {
        $projectList.append("<hr>");
    }

    if (projects.length === 0) {
        $projectList.append($("<div>", {
            'class': "empty-message",
            'text': "No recent folders"
        }));
    }
    projects.reverse().forEach(function(path) {
        addProjectItem(path.split("/").pop(), path, "icons/folder.png", function() {
            runLocalCodebox(path);
        });
    });

    return projects.length > 0;
};

// Update codebox.io account
var updateCodeboxIOAccount = function() {
    var token = storageGet("token");

    if (token) {
        if (confirm("Do you want to unlink this desktop from your CodeboxIO account?") == true) {
            token = "";
        }
    } else {
        token = prompt("Please enter your CodeboxIO Account Token to connect it to this desktop");
    }
    
    storageSet("token", token);
    updateRemote();
}

// Add a path to the projects list
var addProject = function(path) {
    var projects = storageGet("projects", []);

    // Project is already added
    if (projects.indexOf(path) !== -1) return;

    projects.push(path);
    storageSet("projects", projects);
    updateProjects();
};

// Select new project
var selectPath = function() {
    $directorySelector.click();
};


// Start the local ide for a path
var runLocalCodebox = function(path) {
    var win = gui.Window.open("./ide.html?"+path, {
        'title': "Codebox",
        'position': 'center',
        'width': 1024,
        'height': 768,
        'min_height': 400,
        'min_width': 400,
        'show':false,
        'toolbar': false,
        'frame': true,
        'new-instance': true    // Because new isntance, we can't access the win object
    });
    win.maximize();
    return win;
};

// Open the remote ide for a box
var runRemoveCodebox = function(box) {
    var options = {
        'email': storageGet("email"),
        'token': storageGet("token")
    };
    var win = gui.Window.open(box.url+"?"+querystring.stringify(options), {
        'title': "Codebox",
        'position': 'center',
        'width': 1024,
        'height': 768,
        'min_height': 400,
        'min_width': 400,
        'show': true,
        'toolbar': false,
        'frame': true,
        'new-instance': false    // Because new isntance, we can't access the win object
    });
    win.maximize();
    return win;
};

// Menu options
var menu = new gui.Menu();

menu.append(new gui.MenuItem({
    label: 'CodeboxIO Account',
    click: function() {
        updateCodeboxIOAccount();
    }
}));
menu.append(new gui.MenuItem({
    label: 'Reset data',
    click: function() {
        localStorage.clear();
        updateProjects();
    }
}));
menu.append(new gui.MenuItem({ type: 'separator' }));
menu.append(new gui.MenuItem({
    label: 'Quit',
    click: function() {
        gui.App.quit();
    }
}));

// Bind events
$directorySelector.change(function handleFileSelect(evt) {
    var path = $(this).val();
    addProject(path);
    runLocalCodebox(path);
});
$btnOpen.click(function(e) {
    e.preventDefault();
    selectPath();
});
$btnMenu.click(function(e) {
    e.preventDefault();
    var pos = $btnMenu.offset();
    menu.popup(Math.floor(pos.left), Math.floor(pos.top));
});
$alert.click(function(e) {
    e.preventDefault();
    updateCodeboxIOAccount();
});



// Start the application
window.onload = function() {
    var win = gui.Window.get();

    // Show then focus
    win.show();
    win.focus();

    // Start
    !updateRemote();
    if (!updateProjects()) {
        selectPath();
    }
};
