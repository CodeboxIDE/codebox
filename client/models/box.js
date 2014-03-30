define([
    'hr/hr',
    'vendors/socket.io',
    'core/backends/rpc',
    'core/backends/vfs',
    'models/file',
    'models/shell',
    'models/user',
    'models/command',
    'core/operations'
], function (hr, io, rpc, vfs, File, Shell, User, Command, operations) {
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

        initialize: function() {
            Codebox.__super__.initialize.apply(this, arguments);

            this.baseUrl = this.options.baseUrl || "";

            /** Current authenticated user */
            this.user = null;

            /** Root file */
            this.root = new File({
                'codebox': this
            });
            this.root.getByPath("/");
            this.on("change:name", function() {
                this.root.set("name", this.get("name"));
            }, this);

            /** Active file */
            this.activeFile = "/";

            /** Connect to events stream */
            this.listenEvents();

            return this;
        },

        /**
         * Subscribe to events from codebox using socket.io
         */
        listenEvents: function() {
            var that = this;

            vfs.on("event", function(data) {
                var eventName = "box:"+data.event.replace(/\./g, ":");
                that.trigger(eventName, data);
            });

            this.socket("events").then(function(socket) {
                socket.on('event', function(data) {
                    var eventName = "box:"+data.event.replace(/\./g, ":");
                    that.trigger(eventName, data);
                });
                socket.on('connect', function(data) {
                    hr.Offline.check();
                });
                socket.on('connect_failed', function(data) {
                    hr.Offline.check();
                });
                socket.on('reconnect', function(data) {
                    hr.Offline.check();
                });
                socket.on('reconnect_failed', function(data) {
                    hr.Offline.check();
                });
                socket.on('error', function(data) {
                    hr.Offline.check();
                });
                socket.on('disconnect', function(data) {
                    hr.Offline.check();
                });
            });
        },

        /**
         * Socket for the connection
         *
         * @param {string} namespace namespace for the socket
         * @param {boolean} forceCreate force creation of a new socket
         */
        socket: function(namespace, forceCreate) {
            if (this.baseUrl == null) {
                return Q.reject(new Error("Need a 'baseUrl'"));
            }

            var resource = window.location.pathname;
            resource = resource.substring(1, resource.lastIndexOf("/")+1) + "socket.io";

            var socket = io.connect([window.location.protocol, '//', window.location.host].join('')+"/"+namespace, {
                'force new connection': forceCreate,
                'resource': resource
            });

            return Q(socket);
        },

        /**
         * Join the box
         *
         * @param {object} authInfos argument for authentication service
         * @param {User} user
         */
        auth: function(authInfo, user) {
            var that = this;

            this.user = user || new User();

            return rpc.execute("auth/join", authInfo).then(function(info) {
                that.user.set(info);
                that.set("auth", true);
                return Q(info);
            }, function(err) {
                that.set("auth", false);
                return Q.reject(err);
            });
        },

        /**
         * Check if user is logged to the box
         *
         * @return {boolean}
         */
        isAuth: function() {
            return this.get("auth", false);
        },

        /**
         * Get box status
         *
         * @return {promise}
         */
        status: function() {
            var that = this;
            return rpc.execute("box/status").then(function(data) {
                that.set(data);
                return Q(data);
            });
        },

        /**
         * Get list of collaborators
         *
         * @return {promise}
         */
        collaborators: function() {
            return rpc.execute("users/list");
        },

        /**
         * Search files
         *
         * @param q query string
         * @return {promise}
         */
        searchFiles: function(q) {
            return rpc.execute("search/files", {
                "query": q
            });
        },

        /**
         * Get a runner
         *
         * @return {promise}
         */
        runner: function(options) {
            return rpc.execute("run/list", options);
        },

        /**
         * Open a shell
         *
         * @return {TerminalView}
         */
        openTerminal: function(shellId, _op) {
            var terminal = Command.run("terminal.open", shellId);

            if (_op) {
                // Associate to an operation
                var op = operations.start(_op.id, null, _.defaults(_op, {
                    'action': function() {
                        terminal.openTab();
                    }
                }));

                // Terminal is close: finish the operation
                terminal.on("tab:close", function() {
                    op.destroy();
                });
            }

            return terminal;
        },

        /**
         * Run the project
         */
        run: function(options) {
            var that = this;
            return rpc.execute("run/project", options).then(function(runInfos) {
                runInfos.terminal = that.openTerminal(runInfos.shellId);
                return Q(runInfos);
            });
        },

        /**
         * Open a shell
         *
         * @return {Shell}
         */
        openShell: function(args) {
            args = args || {};
            args.codebox = this;
            return new Shell(args);
        },

        /**
         * List shells open
         *
         * @return {promise}
         */
        listShells: function() {
            return rpc.execute("shells/list");
        },

        /**
         * Return running http process
         *
         * @return {promise}
         */
        procHttp: function() {
            return rpc.execute("proc/http");
        },

        /**
         * Set a file (by its path) as active
         */
        setActiveFile: function(path) {
            if (!_.isString(path)) {
                if (path.isNewfile()) {
                    path = null; 
                } else {
                    path = path.path();
                }
            }

            if (this.activeFile == path) return;

            this.activeFile = path;
            this.trigger("file.active", this.activeFile);
            return this;
        }
    });
    

    return Codebox;
});