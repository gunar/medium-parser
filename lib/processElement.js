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
        var _ret = function () {

          if (el.name === 'figure') {
            var caption = $(el).find('figcaption').text();
            // last() because the first img is low res
            var src = $('div > img').last().attr('data-src');
            return {
              v: '\n![' + caption + '](' + src + ')'
            };
          }

          // Can't use .map() because it mutates the element
          var p = [];
          $(el).contents().each(function (i, e) {
            p.push(processElement(e));
          });
          var processed = p.join('');

          // const processed = children.each((i, el) => processElement(el)).join('');

          if (el.name === 'em' || el.name === 'i') {
            return {
              v: '*' + processed + '*'
            };
          }

          if (el.name === 'strong' || el.name === 'b') {
            return {
              v: '**' + processed + '**'
            };
          }

          if (el.name === 'a') {
            var href = $(el).attr('href');
            return {
              v: '[' + processed + '](' + href + ')'
            };
          }

          if (el.name === 'blockquote') {
            return {
              v: '\n> ' + processed
            };
          }

          // TODO Finish refactoring

          if (el.name === 'h4') return {
              v: '\n## ' + processed
            };
          if (el.name === 'h3') return {
              v: '\n# ' + processed
            };
          if (el.name === 'ul') {
            return {
              v: '\n' + processed
            };
          }
          if (el.name === 'li') {
            return {
              v: '\n- ' + processed
            };
          }
          if (el.name === 'p') {
            return {
              v: '\n\n' + processed
            };
          }
          if (el.name === 'img') {
            var alt = $(el).attr('alt') || '';
            var src = $(el).attr('src');
            return {
              v: '![' + alt + '](' + src + ')'
            };
          }
          if (el.name === 'div') return {
              v: '\n' + processed
            };
          if (['figure', 'div', 'figcaption'].indexOf(el.name) > -1) {
            return {
              v: '\n' + processed
            };
          }
          console.log('parse-medium: unprocessed tag <' + el.name + '>');
          return {
            v: '\n' + processed
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }
      return el;
    };

    return processElement;
  });
})( // Help Node out by setting up define.
(typeof module === 'undefined' ? 'undefined' : _typeof(module)) === 'object' && module.exports && typeof define !== 'function' ? function (factory) {
  module.exports = factory(require, exports, module);
} : define);