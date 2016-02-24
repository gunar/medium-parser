'use strict';

var _tape = require('tape');

var _tape2 = _interopRequireDefault(_tape);

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

var _processElement = require('../processElement');

var _processElement2 = _interopRequireDefault(_processElement);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _tape2.default)('processing of html tags', function (t) {
  var html = undefined;
  var actual = undefined;
  var expected = undefined;

  html = '<strong>Para<em>graph</em></strong>';
  actual = (0, _processElement2.default)(html);
  expected = '**Para*graph***';
  t.equal(actual, expected, 'should accept recursive tags');

  html = '<blockquote>* Awesome</blockquote>';
  actual = (0, _processElement2.default)(html);
  expected = '\n> \\* Awesome';
  t.equal(actual, expected, 'should escape *');

  html = '<blockquote>- Awesome</blockquote>';
  actual = (0, _processElement2.default)(html);
  expected = '\n> \\- Awesome';
  t.equal(actual, expected, 'should escape -');

  // Tags

  html = '<p>Paragraph</p>';
  actual = (0, _processElement2.default)(html);
  expected = '\n\nParagraph';
  t.equal(actual, expected, 'should accept <p>');

  html = '<em>graph</em>';
  actual = (0, _processElement2.default)(html);
  expected = '*graph*';
  t.equal(actual, expected, 'should accept <em>');

  html = '<strong>graph</strong>';
  actual = (0, _processElement2.default)(html);
  expected = '**graph**';
  t.equal(actual, expected, 'should accept <strong>');

  html = '<a href="http://medium.com">Medium</a>';
  actual = (0, _processElement2.default)(html);
  expected = '[Medium](http://medium.com)';
  t.equal(actual, expected, 'should accept <a>');

  html = '<blockquote>This is fun</blockquote>';
  actual = (0, _processElement2.default)(html);
  expected = '\n> This is fun';
  t.equal(actual, expected, 'should accept <blockquote>');

  html = '<h4>Subtitle</h4>';
  actual = (0, _processElement2.default)(html);
  expected = '\n## Subtitle';
  t.equal(actual, expected, 'should accept <h4>');

  html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
  actual = (0, _processElement2.default)(html);
  expected = '\n\n- Item 1\n- Item 2';
  t.equal(actual, expected, 'should accept <ul> and <li>');

  html = '<img src="http://google.com/doodle.jpg" alt="Doodle" />';
  actual = (0, _processElement2.default)(html);
  expected = '![Doodle](http://google.com/doodle.jpg)';
  t.equal(actual, expected, 'should accept <img>');

  html = '<figure><div><img data-src="http://google.com/doodle.jpg" /><img data-src="http://google.com/secondDoodle.jpg" /></div><figcaption>Cool</figcaption></figure>';
  actual = (0, _processElement2.default)(html);
  expected = '\n![Cool](http://google.com/secondDoodle.jpg)';
  t.equal(actual, expected, 'should accept <figure> and get second img b/c first is low-res');

  t.end();
});

(0, _tape2.default)('processing the html of an medium post', function (t) {
  var actual = undefined;
  var expected = undefined;

  var html = _fs2.default.readFileSync(_path2.default.resolve(__dirname, '../../mocks/dan.html'), 'utf-8');
  var parsed = (0, _index2.default)(html);

  actual = parsed.markdown;
  expected = _fs2.default.readFileSync(_path2.default.resolve(__dirname, '../../mocks/dan.md'), 'utf-8');
  t.equal(actual, expected, 'should parse local article successfuly');

  actual = parsed.title;
  expected = 'Presentational and Container Components';
  t.equal(actual, expected, 'should parse for title');

  t.end();
});