import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import processGist from './processors/processGist';

const processMedia = url => new Promise((resolve, reject) => {
  fetch(url)
    .then(resp => resp.text())
    .then((html) => {
      const $ = cheerio.load(html);
      if ($('html').has('script[src^="https://gist.github.com/"]').length) { // Github Gist
        // Extract the Gist's ID:
        const gistId = $('body > script').attr('src').replace(/^.*[\\/]/, '').replace(/\.js$/, '');
        processGist(gistId)
          .then((markdown) => { resolve(markdown); });
      } else {
        // Resolve the empty string with a line break if the medium type is not known
        resolve('\n');
      }
    })
    .catch(err => reject(err));
});

export default processMedia;
