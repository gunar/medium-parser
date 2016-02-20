'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

// https://github.com/umdjs/umd/blob/master/templates/nodeAdapter.js
(function (define) {
  define(function (require) {

    var cheerio = require('cheerio');

    var processElement = function processElement(element) {
      var $ = cheerio.load(element);
      var el = $(element).get(0);

      if (el.type === 'text') {
        var text = $(el).text();
        var firstChar = text.substr(0, 1);
        if (['*', '-'].indexOf(firstChar) > -1) {
          return '\\' + text;
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
          var href = $(el).attr('href');
          return '[' + processed + '](' + href + ')';
        }

        if (el.name === 'blockquote') {
          return '\n> ' + processed;
        }
        if (el.name === 'h4') return '\n## ' + processed;
        if (el.name === 'ul') {
          return '\n' + processed;
        }
        if (el.name === 'li') {
          return '\n- ' + processed;
        }
        if (el.name === 'p') {
          return '\n\n' + processed;
        }
        if (el.name === 'figure') {
          var caption = $(el).find('figcaption').contents().toArray();
          return caption;
          console.log($(el).text());
        }
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

    return processElement;
  });
})( // Help Node out by setting up define.
(typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports && typeof define !== 'function' ? function (factory) {
  module.exports = factory(require, exports, module);
} : define);