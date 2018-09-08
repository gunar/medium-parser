import test from 'tape';
import parse from '../index';
import processElement from '../processElement';
import fs from 'fs'
import path from 'path'

test('processing of html tags', t => {
  let html;
  let actual;
  let expected;

  html = '<strong>Para<em>graph</em></strong>';
  actual = processElement(html);
  expected = '**Para*graph***';
  t.equal(actual, expected, 'should accept recursive tags');

  html = '<blockquote>* Awesome</blockquote>';
  actual = processElement(html);
  expected = '\n> \\* Awesome';
  t.equal(actual, expected, 'should escape *');

  html = '<blockquote>- Awesome</blockquote>';
  actual = processElement(html);
  expected = '\n> \\- Awesome';
  t.equal(actual, expected, 'should escape -');

  // Tags

  html = '<p>Paragraph</p>';
  actual = processElement(html);
  expected = '\n\nParagraph';
  t.equal(actual, expected, 'should accept <p>');

  html = '<em>graph</em>';
  actual = processElement(html);
  expected = '*graph*';
  t.equal(actual, expected, 'should accept <em>');

  html = '<strong>graph</strong>';
  actual = processElement(html);
  expected = '**graph**';
  t.equal(actual, expected, 'should accept <strong>');

  html = '<a href="http://medium.com">Medium</a>';
  actual = processElement(html);
  expected = '[Medium](http://medium.com)';
  t.equal(actual, expected, 'should accept <a>');

  html = '<blockquote>This is fun</blockquote>';
  actual = processElement(html);
  expected = '\n> This is fun';
  t.equal(actual, expected, 'should accept <blockquote>');

  html = '<h4>Subtitle</h4>';
  actual = processElement(html);
  expected = '\n## Subtitle';
  t.equal(actual, expected, 'should accept <h4>');

  html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
  actual = processElement(html);
  expected = '\n\n- Item 1\n- Item 2';
  t.equal(actual, expected, 'should accept <ul> and <li>');

  html = '<img src="http://google.com/doodle.jpg" alt="Doodle" />';
  actual = processElement(html);
  expected = '![Doodle](http://google.com/doodle.jpg)';
  t.equal(actual, expected, 'should accept <img>');

  html = '<figure><div><img data-src="http://google.com/doodle.jpg" /><img data-src="http://google.com/secondDoodle.jpg" /></div><figcaption>Cool</figcaption></figure>';
  actual = processElement(html);
  expected = '\n![Cool](http://google.com/secondDoodle.jpg)';
  t.equal(actual, expected, 'should accept <figure> and get second img b/c first is low-res');

  html = `<pre>function add (a, b) {
      return a + b;
  }</pre>`;
  actual = processElement(html);
  expected = `\n~~~\nfunction add (a, b) {
      return a + b;
  }\n~~~\n`;
  t.equal(actual, expected, 'should accept <pre>');

  t.end();
});

test('processing the html of an medium post', t => {
  let actual;
  let expected;

  const html = fs.readFileSync(path.resolve(__dirname, '../../mocks/dan.html'), 'utf-8');
  const parsed = parse(html);

  actual = parsed.markdown;
  expected = fs.readFileSync(path.resolve(__dirname, '../../mocks/dan.md'), 'utf-8');
  t.equal(actual, expected, 'should parse local article successfuly');

  actual = parsed.title;
  expected = 'Presentational and Container Components';
  t.equal(actual, expected, 'should parse for title');

  actual = parsed.headline;
  expected = '';
  t.equal(actual, expected, 'should parse for headline');

  actual = parsed.author;
  expected = 'Dan Abramov';
  t.equal(actual, expected, 'should parse for author');

  actual = parsed.publishedTime;
  expected = '2015-03-23T11:23:45.318Z';
  t.equal(actual, expected, 'should parse for publishedTime');

  t.end();
});

test('author - get author from new html you-might-not-need-redux.html', t => {
  let actual;
  let expected;

  const html = fs.readFileSync(path.resolve(__dirname, '../../mocks/you-might-not-need-redux.html'), 'utf-8');
  const parsed = parse(html);

  actual = parsed.markdown;
  expected = fs.readFileSync(path.resolve(__dirname, '../../mocks/you-might-not-need-redux.md'), 'utf-8');
  t.equal(actual, expected, 'should parse local article successfuly');

  actual = parsed.title;
  expected = 'You Might Not Need Redux';
  t.equal(actual, expected, 'should parse for title');

  actual = parsed.headline;
  expected = '';
  t.equal(actual, expected, 'should parse for headline');

  actual = parsed.author;
  expected = 'Dan Abramov';
  t.equal(actual, expected, 'should parse for author');

  actual = parsed.publishedTime;
  expected = '2016-09-19T21:30:45.266Z';
  t.equal(actual, expected, 'should parse for publishedTime');

  t.end();
});

test('all Info - from html balancing-heuristics-and-data.html with headline', t => {
  let actual;
  let expected;

  const html = fs.readFileSync(path.resolve(__dirname, '../../mocks/balancing-heuristics-and-data.html'), 'utf-8');
  const parsed = parse(html);

  actual = parsed.markdown;

  expected = fs.readFileSync(path.resolve(__dirname, '../../mocks/balancing-heuristics-and-data.md'), 'utf-8');

  t.equal(actual, expected, 'should parse local article successfuly');

  actual = parsed.title;
  expected = 'Balancing heuristics and data';
  t.equal(actual, expected, 'should parse for title');

  actual = parsed.headline;
  expected = 'Why a focus purely on data can miss the big picture';
  t.equal(actual, expected, 'should parse for headline');

  actual = parsed.author;
  expected = 'Skyscanner Engineering';
  t.equal(actual, expected, 'should parse for author');

  actual = parsed.publishedTime;
  expected = '2018-08-08T06:25:00.561Z';
  t.equal(actual, expected, 'should parse for publishedTime');

  t.end();
});
