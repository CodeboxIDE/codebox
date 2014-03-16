define([], function() {
    var settings = codebox.require("core/settings");

    // Add settings
    return settings.add({
        'namespace': "debug",
        'title': "Debug",
        'defaults': {
            'path': "",
            'argument': null,
            'tool': "auto"
        },
        'fields': {
            'path': {
                'label': 'File Path',
                'type': "text",
                'help': "Click left on a file and select 'debug' to update this file."
            },
            'argument': {
                'label': 'Arguments',
                'type': "text",
                'help': "Arguments to run the file with."
            },
            'tool': {
                'label': 'Debugger',
                'type': "select",
                'help': "Force the use of a specific debugger.",
                'options': {
                    'auto': "Auto",
                    'pdb': "Python Debugger",
                    'gdb': "Native Debugger (GDB)",

                    // Still unstable:
                    /*
                    'jdb': "Java Debugger",
                    'rdb': "Ruby Debugger"
                    */
                }
            }
        }
    });
});