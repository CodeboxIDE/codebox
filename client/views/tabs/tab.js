define([
    "hr/utils",
    "hr/dom",
    "hr/hr",
    "models/command",
    "utils/dragdrop",
    "utils/keyboard",
    "utils/contextmenu"
], function(_, $, hr, Command, DragDrop, Keyboard, ContextMenu) {
    // Tab header
    var TabView = hr.List.Item.extend({
        className: "component-tab",
        defaults: {
            title: "",
            tabid: "",
            close: true
        },
        events: {
            "click":        "open",
            "click .close": "close",
            "dblclick":     "split",
            "dragstart":    "dragStart"
        },
        states: {
            'modified': "fa-asterisk",
            'warning': "fa-exclamation",
            'offline': "fa-flash",
            'sync': "fa-exchange",
            'loading': "fa fa-refresh fa-spin"
        },

        // Constructor
        initialize: function() {
            TabView.__super__.initialize.apply(this, arguments);

            var that = this;

            this.$el.attr("draggable", true);

            // Context menu
            ContextMenu.add(this.$el, [
                {
                    'id': "tab.new",
                    'type': "action",
                    'title': "New Tab",
                    'action': function() {
                        //that.tabs.openDefaultNew();
                    }
                },
                { 'type': "divider" },
                {
                    'id': "tab.close",
                    'type': "action",
                    'title': "Close",
                    'action': function() {
                        that.close();
                    }
                },
                {
                    'id': "tab.close.others",
                    'type': "action",
                    'title': "Close Other Tabs",
                    'action': function() {
                        that.closeOthers();
                    }
                },
                { 'type': "divider" },
                {
                    'id': "tab.group.new",
                    'type': "action",
                    'title': "New Group",
                    'action': function() {
                        that.split();
                    }
                },
                { 'type': "divider" },
                that.model.manager.layoutCommand
            ]);

            return this;
        },

        // Render the tab
        render: function() {
            this.$el.empty();

            var inner = $("<div>", {
                "class": "inner",
                "html": this.model.get("title")
            }).appendTo(this.$el);

            var states = this.model.get("state", "").split(" ");
            _.each(states, function(state) {
                if (state && this.states[state]) {
                    $("<i>", {
                        "class": "state fa "+this.states[state]+" state-"+state
                    }).prependTo(inner);
                }
            }, this);

            $("<a>", {
                "class": "close",
                "href": "#",
                "html": "&times;"
            }).prependTo(inner);

            this.$el.toggleClass("active", this.model.isActive());
            
            return this.ready();
        },

        // Return true if is active
        isActive: function() {
            return this.$el.hasClass("active");
        },

        // Set section
        setSection: function(section) {
            /*this.section = section;
            this.open();
            this.tabs.update();*/
        },

        // Create section
        split: function(e) {
            if (e) e.stopPropagation();
            this.setSection(_.uniqueId("section"));
        },

        // (event) open
        open: function(e) {
            if (e != null) e.preventDefault();
            this.model.active();
        },

        // (event) Drag start
        dragStart: function(e) {
            DragDrop.drag(e, "move");
            DragDrop.setData(e, "tab", this.model.id);
        },

        // (event) close
        close: function(e, force) {
            if (e != null) {
                e.preventDefault();
                e.stopPropagation();
            }
            this.model.close(force);
        },

        // (event) close others tabs
        closeOthers: function(e) {
            //this.tabs.closeOthers(this.tabid);
        }
    });

    return TabView;
});