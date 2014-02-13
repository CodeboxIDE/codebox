module.exports = {
    id: "ghpages",
    name: "GitHub Pages",

    configurations: [
        {
            id: "push",
            name: "Push",
            deploy: "git push origin gh-pages"
        }
    ]
};