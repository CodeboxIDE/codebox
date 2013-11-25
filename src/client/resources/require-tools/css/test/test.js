var requirejs = require('requirejs');

var passed = 0;
var failed = 0;
var assert = function(name, statement, val) {
  if (statement === val) {
    console.log('  ' + name + '... passed.');
    passed++;
  }
  else {
    console.log('  ' + name + '... failed.\n  ' + 'Expected "' + val + '" got "' + statement + '"\n');
    failed++;
  }
}

requirejs(['../css', '../normalize'], function(css, normalize) {
  console.log('\n--- Starting Require CSS Tests ---');
  
  console.log('\nTesting URL Base Conversions');
  assert(
    'Changing subfolder', 
    normalize.convertURIBase('test', '/one/two/', '/one/three/'), 
    '../two/test'
  );
  assert(
    'Changing subfolder with backtrack', 
    normalize.convertURIBase('../test', '/one/two/', '/one/three/'), 
    '../test'
  );
  assert(
    'Changing two subfolders with a folder',
    normalize.convertURIBase('some/test', '/one/two/three/', '/one/four/five/'),
    '../../two/three/some/test'
  );
  assert(
    'Double forward slashes in relative URI',
    normalize.convertURIBase('some//test', '/one/two/three/', '/one/two/four/'),
    '../three/some/test'
  );
  assert(
    'protocol base urls work',
    normalize.convertURIBase('some/file', 'http://www.google.com:80/', 'http://www.google.com:80/sub/'),
    '../some/file'
  );
  assert(
    'absolute protocol paths work with base conversion',
    normalize.convertURIBase('some/file', 'http://some.cdn.com/baseUrl/', 'baseUrl/'),
    'http://some.cdn.com/baseUrl/some/file'
  );
  console.log('\nTesting Stylesheet Regular Expressions');
  assert(
    '@import statements',
    normalize('@import "test.css"', '/first/', '/second/'),
    '@import "../first/test.css"'
  );
  assert(
    'url includes',
    normalize('background: url("../some/test.css")', '/first/one/', '/second/one/'),
    'background: url("../../first/some/test.css")'
  );
  assert(
    'multiple url includes on the same line',
    normalize('src: url("../fonts/font.eot") format("embedded-opentype"), url("../fonts/font.woff") format("woff");', '/base/', '/'),
    'src: url("fonts/font.eot") format("embedded-opentype"), url("fonts/font.woff") format("woff");'
  );
  assert(
    'cssBase can apply to imports',
    normalize('@import "/some-file"', '/first/', '/second/', 'http://www.my-website.com'),
    '@import "http://www.my-website.com/some-file"'
  );
  assert(
    'cssBase can apply to urls',
    normalize('background: url(\'/absolute/source.jpg\');', 'asdf', 'qwer', '/basePath'),
    'background: url(\'/basePath/absolute/source.jpg\');'
  );

  console.log('\n--- Require CSS Tests Complete: ' + passed + ' passed, ' + failed + ' failed. ---\n');
});
