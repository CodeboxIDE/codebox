define([
    "hr/utils",
    "hr/promise",
    "hr/hr",
    "core/rpc",
    "models/file",
    "models/schema"
], function(_, Q, hr, rpc, File, Schema) {
    var Manager = hr.Class.extend({
        initialize: function() {
            Manager.__super__.initialize.apply(this, arguments);

            this.settings = {};
            this.schemas = new (hr.Collection.extend({ model: Schema }));
        },

        // Add/Get a schema
        schema: function(id, infos) {
            var that = this;

            if (!infos) return this.schemas.get(id);

            this.schemas.add({
                'id': id,
                'schema': infos
            });
            this.importJSON(this.settings, {
                save: false,
                silent: false
            });

            return this.schema(id);
        },

        // Export
        exportJson: function() {
            var that = this;
            return _.object(
                this.schemas.map(function(schema) {
                    return [
                        schema.id,
                        schema.getData()
                    ];
                })
            );
        },

        // Import
        importJSON: function(data, options) {
            options = _.defaults(options || {}, {
                save: true,
                silent: false
            });

            this.settings = data;

            this.schemas.each(function(schema) {
                schema.data.set(_.defaults(this.settings[schema.id] || {}, schema.getDefaults()), {
                    silent: options.silent
                });
            }, this);

            if (options.save) {
                return this.save();
            }

            return Q();
        },

        // Get file
        getFile: function() {
            // Generate the string content
            var code = JSON.stringify(this.exportJson(), null, 4);

            // Build the file buffer
            var f = File.buffer("Codebox Settings.json", code, "codebox-settings.json");

            // Handle write operations
            this.listenTo(f, "write", function(data) {
                this.importJSON(JSON.parse(data));
            });

            return f;
        },

        // Save settings on the server
        save: function() {
            return rpc.execute("settings/set", this.exportJson());
        },

        // Load settings from the server
        load: function() {
            return rpc.execute("settings/get")
            .then(_.partialRight(this.importJSON, { save: false }).bind(this));
        },

        // Return as a schema
        toSchema: function() {
            return {
                title: "Settings",
                type: "array",
                items: this.schemas.toJSON()
            };
        }
    });

    var settings = new Manager();
    return settings;
});