// Requires
var gui = require('nw.gui');
var path = require('path');

var Q = require('q');
var _ = require('underscore');

// Port allocation
var qClass = require('qpatch').qClass;
var harbor = qClass(require('harbor'));
var ports = new harbor(19000, 20000);


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
    var projects = storageGet("projects", []);
    $projectList.empty();

    if (projects.length === 0) {
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
        $("<img>", {
            'src': "icons/folder.png",
            'class': 'project-icon'
        }).appendTo($project);
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

var runCodebox = function(path) {
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

// Start the application
window.onload = function() {
    var win = gui.Window.get();

    // Show then focus
    win.show();
    win.focus();

    // Start
    if (!updateProjects()) {
        selectPath();
    }
};
