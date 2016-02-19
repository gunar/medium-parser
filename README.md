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
    markdown: '# Markdown\nAs string...',
  }
*/
```

## License

MIT [http://gunar.mit-license.org]()
