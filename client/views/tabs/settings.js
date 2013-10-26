define([
    "Underscore",
    "jQuery",
    "hr/hr",
    "views/tabs/base",
    "session"
], function(_, $, hr, BaseTab, session) {
    var SettingsTab = BaseTab.extend({
        className: BaseTab.prototype.className+ " component-workspace-settings",
        events: {
            "submit form": "saveSettings"
        },
        template: "tabs/settings.html",

        /* Constructor */
        initialize: function(options) {
            SettingsTab.__super__.initialize.apply(this, arguments);
            this.setTabTitle("Settings");
            return this;
        },


        saveSettings: function(e) {
            if (e) {
                e.preventDefault();
            }

            var editor_data = {
                "theme":                this.$("select[name='editor_theme']").val(),
                "keyboard":             this.$("select[name='editor_keyboard']").val(),
                "fontsize":             this.$("input[name='editor_fontsize']").val(),
                "printmargincolumn":    this.$("input[name='editor_printmargincolumn']").val(),
                "wraplimitrange":       this.$("input[name='editor_wraplimitrange']").val(),
                "showprintmargin":      this.$("input[name='editor_showprintmargin']").is(":checked"),
                "highlightactiveline":  this.$("input[name='editor_highlightactiveline']").is(":checked"),
                "enablesoftwrap":       this.$("input[name='editor_enablesoftwrap']").is(":checked"),
            };

            session.user.set("settings.editor", editor_data);
        }
    });

    return SettingsTab;
});