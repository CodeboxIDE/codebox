var gui = require('nw.gui');
var path = require('path');
var codebox = require('../../index.js');
var _ = require('underscore');

// IDEs
var instances = {};
var windows = {};

// DOM elements
var $directorySelector = $('#directory-selector');
var $projectList = $('#projects');
var $btnOpen = $("#open-new");


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


// Update list of projects
var updateProjects = function() {
    var projects = storageGet("projects");
    $projectList.empty();

    if (projects.length == 0) {
        $projectList.append($("<div>", {
            'class': "empty-message",
            'text': "No recent folders"
        }));
    }

    
    projects.reverse().forEach(function(path) {
        var $project = $("<li>", {
            'class': "project",
            "project": path
        });
        $("<p>", {
            'text': path.split("/").pop(),
            'class': 'project-title'
        }).appendTo($project);
        $("<p>", {
            'text': path,
            'class': 'project-path'
        }).appendTo($project);

        $projectList.append($project);
    });

    return projects.length > 0;
};

// Add a path to the projects list
var addProject = function(path) {
    var projects = storageGet("projects");

    if (projects.indexOf(path) >= 0) return;

    projects.push(path);
    storageSet("projects", projects)
    updateProjects();
}

// Select new project
var selectPath = function() {
    $directorySelector.click();
}

var openWindow = function(url) {
    if (windows[url]) {
        windows[url].focus();
        return;
    }

    var win = gui.Window.open(url, {
        'title': "Codebox",
        'position': 'center',
        'width': 1024,
        'height': 768,
        'min_height': 400,
        'min_width': 400,
        'show':true,
        'toolbar': false,
        'frame': true
    });
    windows[url] = win;

    win.on("close", function() {
        windows[url] = null;
        this.close(true);
    });

    return win;
};

var runCodebox = function(path) {
    if (instances[path]) {
        openWindow(instances[path].url);
        
        return;
    }


    var port = 8000+_.size(instances);
    var url = "http://localhost:"+port;
    instances[path] = {
        'url': url
    };

    codebox.start({
        'root': path,
        'server': {
            'port': port
        },
        'addons': {
            'blacklist': ["cb.offline"]
        }
    }).then(function() {
        openWindow(url);
        
    }, function(err) {
        console.error('Error initializing CodeBox');
        console.error(err);
        console.error(err.stack);
    })
};

// Bind events
$directorySelector.change(function handleFileSelect(evt) {
    var path = $(this).val();
    addProject(path);
    runCodebox(path);
});
$btnOpen.click(function(e) {
    e.preventDefault();
    selectPath();
});
$projectList.on("click", ".project", function(e) {
    e.preventDefault();
    runCodebox($(e.currentTarget).attr("project"));
});

// Start
if (!updateProjects()) {
    selectPath();
}