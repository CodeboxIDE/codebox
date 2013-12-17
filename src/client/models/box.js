define([
    'hr/hr',
    'vendors/socket.io',
    'core/api',
    'models/file',
    'models/shell',
    'models/user',
    'core/operations'
], function (hr, io, api, File, Shell, User, operations) {
    var logging = hr.Logger.addNamespace("codebox");

    var Codebox = hr.Model.extend({
        defaults: {
            'status': null,
            'name': null,
            'uptime': 0,
            'mtime': 0,
            'collaborators': 0,
            'auth': false
        },

        /*
         *  Client interface to a codebox
         */
        initialize: function() {
            Codebox.__super__.initialize.apply(this, arguments);

            this.baseUrl = this.options.baseUrl || "";
            this.state = false;

            this.user = null;

            // Root file
            this.root = new File({
                'codebox': this
            });
            this.root.getByPath("/");

            // Connect to events
            this.listenEvents();

            return this;
        },

        /*
         *  Subscribe to events from codebox using socket.io
         */
        listenEvents: function() {
            var that = this;

            this.socket("events").then(function(socket) {
                socket.on('event', function(data) {
                    var eventName = "box:"+data.event.replace(/\./g, ":");
                    that.trigger(eventName, data);
                });
                socket.on('connect', function(data) {
                    that.setStatus(true);
                });
                socket.on('connect_failed', function(data) {
                    that.setStatus(false);
                });
                socket.on('reconnect', function(data) {
                    that.setStatus(true);
                });
                socket.on('reconnect_failed', function(data) {
                    that.setStatus(true);
                });
                socket.on('error', function(data) {
                    that.setStatus(false);
                });
                socket.on('disconnect', function(data) {
                    that.setStatus(false);
                });
            });
        },

        /*
         *  Set codebox status (working or not)
         *  
         *  @status : boolean for the status
         */
        setStatus: function(state) {
            this.state = state;
            logging.log("status ", this.state);
            this.trigger("status", state);
        },

        /*
         *  Socket for the connexion
         *
         *  @namespace : namespace for the socket
         *  @forceCreate : force creation of a new socket
         */
        socket: function(namespace, forceCreate) {
            if (this.baseUrl == null) {
                return Q.reject(new Error("Need a 'baseUrl'"));
            }
            var socket = io.connect([window.location.protocol, '//', window.location.host].join('')+"/"+namespace, {
                'force new connection': forceCreate
            });

            return Q(socket);
        },

        /*
         *  Join the box
         */
        auth: function(authInfo, user) {
            var that = this;

            this.user = user || new User();

            return api.rpc("/auth/join", authInfo).then(function(info) {
                that.user.set(info);
                that.set("auth", true);
                return Q(info);
            }, function(err) {
                that.set("auth", false);
                return Q.reject(err);
            });
        },

        /*
         *  test if logged to the box
         */
        isAuth: function() {
            return this.get("auth", false);
        },

        /*
         *  Get box status
         */
        status: function() {
            var that = this;
            return api.rpc("/box/status").then(function(data) {
                that.set(data);
                return Q(data);
            });
        },

        /*
         *  Get list of collaborators
         */
        collaborators: function() {
            return api.rpc("/users/list");
        },

        /*
         *  Get git status
         */
        gitStatus: function() {
            return api.rpc("/git/status");
        },

        /*
         *  Get git push
         */
        gitPush: function() {
            return operations.start("git.push", function(op) {
                return api.rpc("/git/push")
            }, {
                title: "Pushing"
            });
        },

        /*
         *  Checkout a referance
         */
        gitCheckout: function(ref) {
            return operations.start("git.checkout", function(op) {
                return api.rpc("/git/checkout", {
                    'ref': ref
                })
            }, {
                title: "Checkout '"+ref+"'"
            });
        },

        /*
         *  Create a branch
         */
        gitBranchCreate: function(name) {
            return operations.start("git.branch.create", function(op) {
                return api.rpc("/git/branch_create", {
                    'name': name
                })
            }, {
                title: "Creating branch '"+name+"'"
            });
        },

        /*
         *  Delete a branch
         */
        gitBranchDelete: function(name) {
            return operations.start("git.branch.delete", function(op) {
                return api.rpc("/git/branch_delete", {
                    'name': name
                })
            }, {
                title: "Deleting branch '"+name+"'"
            });
        },

        /*
         *  List branches
         */
        gitBranches: function(name) {
            return api.rpc("/git/branches");
        },

        /*
         *  Get git pull
         */
        gitPull: function() {
            return operations.start("git.pull", function(op) {
                return api.rpc("/git/pull")
            }, {
                title: "Pulling"
            });
        },

        /*
         *  Get commits chages
         */
        commitsPending: function() {
            return api.rpc("/git/commits_pending");
        },

        /*
         *  Search files
         */
        searchFiles: function(q) {
            return api.rpc("/search/files", {
                "query": q
            });
        },

        /*
         *  Commit to the git workspace
         */
        commit: function(args) {
            args = _.extend(args || {});
            return operations.start("git.commit", function(op) {
                return api.rpc("/git/commit", args)
            }, {
                title: "Commiting"
            });
        },

        /*
         *  Sync (pull & push) the git workspace
         */
        sync: function() {
            return operations.start("git.sync", function(op) {
                return api.rpc("/git/sync")
            }, {
                title: "Synchronization"
            });
        },

        /*
         *  Open a shell
         */
        openShell: function(args) {
            args = args || {};
            args.codebox = this;
            return new Shell(args);
        },

        /*
         *  Return an http proxy url
         */
        proxyUrl: function(url) {
            return this.baseUrl+"/proxy/"+encodeURIComponent(url);
        },

        /*
         *  Return running http process
         */
        procHttp: function() {
            return api.rpc("/proc/http");
        },
    });
    

    return Codebox;
});