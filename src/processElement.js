const cheerio = require('cheerio');
const processMedia = require('./processMedia');

const processElement = async element => {
  const $ = cheerio.load(element);
  const el = $(element).get(0);

  if (el.type === 'text') {
    const text = $(el).text();
    const escaped = text.replace(/[#_*~><>/\\[\]!()`-]+/g, (symbol) => {
      let output = '';
      for (let i = 0; i < symbol.length; i += 1) {
        output += `\\${symbol[i]}`;
      }
      return output;
    });
    return escaped;
  }
  if (el.type === 'tag') {
    if (el.name === 'figure') {
      if ($(el).has('iframe').length) {
        const url = `https://medium.com${$(el).find('iframe').attr('src')}`;
        return processMedia(url)
      } else {
        const caption = $(el).find('figcaption').text();
        // last() because the first img is low res
        const img = $('div > img').last();
        const src = img.attr('data-src') || img.attr('src');
        return `\n![${caption}](${src})`;
      }
    } else if (el.name === 'pre') {
      // pre tags should not have their contents escaped
      return `\n~~~\n${$(el).html()}\n~~~\n`;
    } else {
      // Can't use .map() because it mutates the element
      const p = [];
      $(el).contents().each((i, e) => {
        p.push(processElement(e));
      });

      return Promise.all(p).then((results) => {
        let processed = results.join('');

        // Remove the leading and trailing whitespace from the inside of a tag
        let leadingWhitespace = '';
        let trailingWhitespace = '';
        processed = processed.replace(/^\s+/g, (whitespace) => {
          leadingWhitespace = whitespace;
          return '';
        });
        processed = processed.replace(/\s+$/g, (whitespace) => {
          trailingWhitespace = whitespace;
          return '';
        });

        // Add the removed whitespace to the outside of inline elements
        if (el.name === 'em' || el.name === 'i') {
          return `${leadingWhitespace}*${processed}*${trailingWhitespace}`;
        }
        if (el.name === 'strong' || el.name === 'b') {
          return `${leadingWhitespace}**${processed}**${trailingWhitespace}`;
        }
        if (el.name === 'a') {
          const href = $(el).attr('href');
          return `${leadingWhitespace}[${processed}](${href})${trailingWhitespace}`;
        }
        if (el.name === 'blockquote') {
          return `\n> ${processed}`;
        }
        if (el.name === 'h4') {
          return `\n#### ${processed}`;
        }
        if (el.name === 'h3') {
          return `\n### ${processed}`;
        }
        if (el.name === 'h2') {
          return `\n## ${processed}`;
        }
        if (el.name === 'h1') {
          return `\n# ${processed}`;
        }
        if (el.name === 'ul') {
          return `\n\n${processed}`;
        }
        if (el.name === 'li') {
          return `\n- ${processed}`;
        }
        if (el.name === 'p') {
          return `\n\n${processed}`;
        }
        if (el.name === 'img') {
          const alt = $(el).attr('alt') || '';
          const src = $(el).attr('src');
          return `![${alt}](${src})`;
        }
        if (el.name === 'div') {
          return `\n${processed}`;
        }
        if (['figure', 'div', 'figcaption'].indexOf(el.name) > -1) {
          return `\n${processed}`;
        }
        console.log(`parse-medium: unprocessed tag <${el.name}>`);
        return `\n${processed}`;
      });
    }
  } else {
    return el;
  }
};

module.exports = processElement;
