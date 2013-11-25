({
  appDir: 'www',
  dir: 'www-built',
  baseUrl: '.',
  fileExclusionRegExp: /(^example)|(.git)|node_modules$/,
  packages: [
  {
    name: 'less',
    location: 'require-less',
    main: 'less'
  }
  ],
  modules: [
    {
      name: 'core-components',
      create: true,
      include: ['components/component'],
      exclude: ['less/normalize']
    },
    {
      name: 'app',
      exclude: ['core-components', 'less']
    }
  ],
  paths: {
    style: 'less-style'
  }
})
