# medium-parser

A simple parser for Medium (html) into Markdown.

## Example usage

`npm install medium-parser`

then

```js
var parse = require('medium-parser');

var post = parse(htmlAsString);
/*
  post == {
    title: 'Post title',
    headline: 'Headline from h2 tag',
    author: 'Some author',
    publishedTime: '2016-09-19T21:30:45.266Z',
    markdown: '# Markdown\nAs string...',
  }
*/
```

## Unit test

```
npm run test
```

## License

MIT [http://gunar.mit-license.org]()
