const cheerio = require('cheerio');
const processElement = require('./processElement');

const parse = (html) => {
  const $ = cheerio.load(html);
  const elements = $('.section-inner').contents().toArray();
  const title = $('h1').first().text();
  const headline = $('h2').first().text();
  const author = $('meta[property=author]').attr('content');
  const publishedTime = $('meta[property="article:published_time"]').attr('content');

  return Promise.all(elements.map(processElement)).then((results) => {
    const markdown = results.join('\n').replace(/\n\n\n/g, '\n\n');
    return {
      title,
      headline,
      author,
      publishedTime,
      markdown,
    };
  });
};

module.exports = parse;
