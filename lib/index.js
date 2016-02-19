'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

// https://github.com/umdjs/umd/blob/master/templates/nodeAdapter.js
(function (define) {

  define(function (require, exports, module) {
    var cheerio = require('cheerio');
    var $;

    var processElement = function processElement(element) {
      var el = $(element).get(0);
      if (el.type === 'text') {
        var text = $(el).text();
        var firstChar = text.substr(0, 1);
        if (['*', '-'].indexOf(firstChar) > -1) {
          text = '\\' + text;
        }
        return text;
      }
      if (el.type === 'tag') {
        var children = $(el).contents().toArray();
        var processed = children.map(processElement).join('');
        if (el.name === 'em' || el.name === 'i') {
          return '*' + processed + '*';
        }
        if (el.name === 'strong' || el.name === 'b') {
          return '**' + processed + '**';
        }
        if (el.name === 'a') {
          return '[' + processed + '](' + $(el).attr('href') + ')';
        }
        if (el.name === 'blockquote') {
          return '> ' + processed;
        }
        if (el.name === 'h4') return '\n## ' + processed;
        if (el.name === 'h3') return '# ' + processed;
        if (el.name === 'ul') {
          return '\n' + processed;
        }
        if (el.name === 'li') {
          return '\n- ' + processed;
        }
        if (el.name === 'p') {
          return '\n\n' + processed;
        }
        // if (el.name === 'figure') {
        //   console.log($(el).text());
        // }
        if (el.name === 'img') {
          var alt = $(el).attr('alt') || '';
          return '![' + alt + '](' + $(el).attr('src') + ')';
        }
        if (el.name === 'div') return '\n' + processed;
        if (['figure', 'div', 'figcaption'].indexOf(el.name) > -1) {
          return '\n' + processed;
        }
        console.log('parse-medium: unprocessed tag <' + el.name + '>');
        return '\n' + processed;
      }
      return el;
    };

    var parseMedium = function parseMedium(html) {
      $ = cheerio.load(html);
      var title = $('h3').first().text();
      var markdown = $('.section-inner').contents().toArray().map(processElement).join('\n');
      return {
        title: title,
        markdown: markdown
      };
    };

    return parseMedium;
  });
})( // Help Node out by setting up define.
(typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports && typeof define !== 'function' ? function (factory) {
  module.exports = factory(require, exports, module);
} : define);
