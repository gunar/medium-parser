import * as cheerio from 'cheerio';
import processMedia from './processMedia';

const processElement = element => new Promise((resolve, reject) => {
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
    resolve(escaped);
  } else if (el.type === 'tag') {
    if (el.name === 'figure') {
      if ($(el).has('iframe').length) {
        const url = `https://medium.com${$(el).find('iframe').attr('src')}`;
        processMedia(url)
          .then((markdown) => { resolve(markdown); });
      } else {
        const caption = $(el).find('figcaption').text();
        // last() because the first img is low res
        const img = $('div > img').last();
        const src = img.attr('data-src') || img.attr('src');
        resolve(`\n![${caption}](${src})`);
      }
    } else if (el.name === 'pre') {
      // pre tags should not have their contents escaped
      resolve(`\n~~~\n${$(el).html()}\n~~~\n`);
    } else {
      // Can't use .map() because it mutates the element
      const p = [];
      $(el).contents().each((i, e) => {
        p.push(processElement(e));
      });

      Promise.all(p).then((results) => {
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
          resolve(`${leadingWhitespace}*${processed}*${trailingWhitespace}`);
        } else if (el.name === 'strong' || el.name === 'b') {
          resolve(`${leadingWhitespace}**${processed}**${trailingWhitespace}`);
        } else if (el.name === 'a') {
          const href = $(el).attr('href');
          resolve(`${leadingWhitespace}[${processed}](${href})${trailingWhitespace}`);
        } else if (el.name === 'blockquote') {
          resolve(`\n> ${processed}`);
        } else if (el.name === 'h4') {
          resolve(`\n### ${processed}`);
        } else if (el.name === 'h3') {
          resolve(`\n## ${processed}`);
        } else if (el.name === 'h1') {
          resolve(`\n# ${processed}`);
        } else if (el.name === 'ul') {
          resolve(`\n\n${processed}`);
        } else if (el.name === 'li') {
          resolve(`\n- ${processed}`);
        } else if (el.name === 'p') {
          resolve(`\n\n${processed}`);
        } else if (el.name === 'img') {
          const alt = $(el).attr('alt') || '';
          const src = $(el).attr('src');
          resolve(`![${alt}](${src})`);
        } else if (el.name === 'div') {
          resolve(`\n${processed}`);
        } else if (['figure', 'div', 'figcaption'].indexOf(el.name) > -1) {
          resolve(`\n${processed}`);
        } else {
          console.log(`parse-medium: unprocessed tag <${el.name}>`);
          resolve(`\n${processed}`);
        }
      }).catch((err) => {
        reject(err);
      });
    }
  } else {
    resolve(el);
  }
});

export default processElement;
