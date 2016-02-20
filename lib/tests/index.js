'use strict';

var _tape = require('tape');

var _tape2 = _interopRequireDefault(_tape);

var _processElement = require('../processElement');

var _processElement2 = _interopRequireDefault(_processElement);

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

  html = '<figure><img src="http://google.com/doodle.jpg" /><figcaption>Cool</figcaption></figure>';
  actual = (0, _processElement2.default)(html);
  expected = '\n![Cool](http://google.com/doodle.jpg)';
  t.equal(actual, expected, 'should accept <figure>');

  t.end();
});