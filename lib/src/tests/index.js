import test from 'tape';
import processElement from '../processElement';

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

  html = '<figure><img src="http://google.com/doodle.jpg" /><figcaption>Cool</figcaption></figure>';
  actual = processElement(html);
  expected = '\n![Cool](http://google.com/doodle.jpg)';
  t.equal(actual, expected, 'should accept <figure>');


  t.end();
});
