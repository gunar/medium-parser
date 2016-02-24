// https://github.com/umdjs/umd/blob/master/templates/nodeAdapter.js
(function(define) {
  define(function (require, exports, module) {

    var cheerio = require('cheerio');
    var processElement = require('./processElement.js');

    const parseMedium = html => {
      const $ = cheerio.load(html);
      const title = $('h3').first().text();
      const content = $('.section-inner').html();
      // const markdown = processElement(content);
      const markdown = $('.section-inner').contents().toArray().map(processElement).join('\n').replace(/\n\n\n/g,'\n\n');
      return {
        title,
        markdown,
      };
    };

    return parseMedium;

  });

}( // Help Node out by setting up define.
  typeof module === 'object' && module.exports && typeof define !== 'function' ?
    function (factory) { module.exports = factory(require, exports, module); } :
      define
 ));
