var gui = require('nw.gui');
var path = require('path');
var codebox = require('../../index.js');

// IDEs
var countInstances = 0;

// DOM elements
var $directorySelector = $('#directory-selector');
var $projectList = $('#projects');
var $btnOpen = $("#open-new");

// Update list of projects
var updateProjects = function() {
    var projects = JSON.parse(localStorage.projects || "[]");

    $projectList.empty();
    projects.forEach(function(path) {
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
}

// Add a path to the projects list
var addProject = function(path) {
    var projects = JSON.parse(localStorage.projects || "[]");

    if (projects.indexOf(path) < 0) return;

    projects.push(path);
    localStorage.projects = JSON.stringify(projects);
    updateProjects();
}

// Select new project
var selectPath = function() {
    $directorySelector.click();
}

var runCodebox = function(path) {
    var port = 8000+countInstances;
    countInstances++;

    codebox.start({
        'root': path,
        'server': {
            'port': port
        },
        'addons': {
            'blacklist': ["cb.offline"]
        }
    }).then(function() {
        var url = "http://localhost:"+port;

        console.log("\nCodebox is running at",url);
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
})



// Start
if (!updateProjects()) {
    selectPath();
}