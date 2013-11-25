require-less
===========

Optimizable LESS requiring with RequireJS

Based on the [require-css module](https://github.com/guybedford/require-css), read the documentation there for usage instructions.

Basic Overview
--------------

Allows the construction of scripts that can require LESS files, using the simple RequireJS syntax:

```javascript
define(['less!styles/main'], function() {
  //code that requires the stylesheet: styles/main.less
});
```

When run the in the browser, less is downloaded, parsed and injected. When running a build with the RequireJS optimizer, less is compiled into the build layers dynamically as css with compression support.

Installation and Setup
----------------------

Download the require-less folder manually or use [volo](https://github.com/volojs/volo)(`npm install volo -g`):

```
volo add guybedford/require-less
```

Volo will automatically download [require-css](https://github.com/guybedford/require-css/zipball/master), which is a needed dependency.

Then add the following package configuration in RequireJS:

```javascript
packages: [
  {
    name: 'css',
    location: 'require-css',
    main: 'css'
  },
  {
    name: 'less',
    location: 'require-less',
    main: 'less'
  }
]
```

Builds
------

The RequireCSS build system is used to build LESS. The exact same options thus apply.

Pending [r.js issue 289](https://github.com/jrburke/r.js/issues/289), the modules `require-css/css-builder` and `require-less/lessc` require a shallow exclude.

Thus, add the following shallow exclusions in the r.js build configuration for each module if using `modules` for a layered build, or at the base-level build configuration if doing a file-based build:

```javascript
{
  excludeShallow: ['css/css-builder', 'less/lessc-server', 'less/lessc'],
  include: ['css']
}
```

This shouldn't be necessary in future versions.

Note also that the `css` module itself must be included at the beginning of the layer otherwise this will result in a separate HTTP request to CSS.

