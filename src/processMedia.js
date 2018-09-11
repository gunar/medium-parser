const cheerio = require('cheerio');
const fetch = require('node-fetch');
const processGist = require('./processors/processGist');

const processMedia = async url =>
  fetch(url)
    .then(resp => resp.text())
    .then((html) => {
      const $ = cheerio.load(html);
      if ($('html').has('script[src^="https://gist.github.com/"]').length) { // Github Gist
        // Extract the Gist's ID:
        const gistId = $('body > script').attr('src').replace(/^.*[\\/]/, '').replace(/\.js$/, '');
        return processGist(gistId)
      }
      // If media type is unknown, return line break
      return '\n';
    });

module.exports = processMedia;
