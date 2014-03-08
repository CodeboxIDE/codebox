define(['require'], function(require) {
  
  var lessAPI = {};
  
  lessAPI.pluginBuilder = './less-builder';
  
  if (typeof window == 'undefined') {
    lessAPI.load = function(n, r, load) { load(); }
    return less;
  }
  
  lessAPI.normalize = function(name, normalize) {
    if (name.substr(name.length - 5, 5) == '.less')
      name = name.substr(0, name.length - 5);

    name = normalize(name);

    return name;
  }
  
  var head = document.getElementsByTagName('head')[0];

  var pagePath = window.location.href.split('/');
  pagePath[pagePath.length - 1] = '';
  pagePath = pagePath.join('/');

  var baseUrl;

  // set initial default configuration
  window.less = window.less || {
    env: 'development'
  };

  var styleCnt = 0;
  var curStyle;
  lessAPI.inject = function(css) {
    if (styleCnt < 31) {
      curStyle = document.createElement('style');
      curStyle.type = 'text/css';
      head.appendChild(curStyle);
      styleCnt++;
    }
    if (curStyle.styleSheet)
      curStyle.styleSheet.cssText += css;
    else
      curStyle.appendChild(document.createTextNode(css));
  }

  var parser;

  lessAPI.load = function(lessId, req, load, config) {
    require(['./lessc', './normalize'], function(lessc, normalize) {

      if (!baseUrl) {
        var baseParts = require.toUrl('base_url').split('/');
        baseParts[baseParts.length - 1] = '';
        baseUrl = normalize.absoluteURI(baseParts.join('/'), pagePath) + '/';
      }

      var fileUrl = req.toUrl(lessId + '.less');
      fileUrl = normalize.absoluteURI(fileUrl, baseUrl);

      parser = parser || new lessc.Parser(window.less);

      parser.parse('@import "' + fileUrl + '";', function(err, tree) {
        if (err)
          return load.error(err);

        lessAPI.inject(normalize(tree.toCSS(), fileUrl, pagePath));

        setTimeout(load, 7);
      });

    });
  }
  
  return lessAPI;
});
