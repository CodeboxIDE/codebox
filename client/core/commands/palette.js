define([
    'views/commands/palette',
    'core/commands/toolbar',
    'core/search'
], function (PaletteView, commands, search) {

    var palette = new PaletteView({
        searchHandler: _.bind(search.query, search)
    });

    commands.register("palette.toggle", {
        title: "Palette",
        icons: {
            'default': "search",
        },
        position: 0,
        shortcuts: [
            "alt+s", "mod+shift+p"
        ]
    }, function() {
        palette.toggle();
    });

    return palette;
});