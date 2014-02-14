module.exports = {
    id: "heroku",
    name: "Heroku",

    settings: {
        name: {
            label: "Name",
            type: "text",
            help: "Application name from your heroku account."
        },
        key: {
            label: "Key",
            type: "text",
            help: "You can find your API key in your settings Heroku."
        }
    },

    actions: [
        {
            id: "push:key",
            name: "Deploy Public Key",
            action: function() {
                
            }
        },
        {
            id: "push",
            name: "Push",
            action: function() {
                
            }
        }
    ]
};