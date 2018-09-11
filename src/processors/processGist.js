const fetch = require('node-fetch');

const processGist = gistId =>
  fetch(`https://api.github.com/gists/${gistId}`)
    .then(resp => resp.json())
    .then((json) => {
      let markdown = '\n';
      for (let i = 0; i < Object.keys(json.files).length; i += 1) {
        const file = json.files[Object.keys(json.files)[i]];
        markdown += `\n~~~${file.language}\n${file.content}\n~~~\n`;
      }
      return markdown;
    })

module.exports = processGist;
