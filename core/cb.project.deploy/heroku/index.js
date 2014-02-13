module.exports = {
    id: "heroku",
    name: "Heroku",

    settings: {
        key: {
            label: "Key",
            type: "text",
            help: "You can find your API key in your settings Heroku."
        }
    },

    configurations: function() {
        return [];
    }
};