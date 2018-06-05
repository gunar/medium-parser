import fetch from 'node-fetch';

const processGist = gistId => new Promise((resolve, reject) => {
  fetch(`https://api.github.com/gists/${gistId}`)
    .then(resp => resp.json())
    .then((json) => {
      let markdown = '\n';
      for (let i = 0; i < Object.keys(json.files).length; i += 1) {
        const file = json.files[Object.keys(json.files)[i]];
        markdown += `\n~~~${file.language}\n${file.content}\n~~~\n`;
      }
      resolve(markdown);
    })
    .catch(err => reject(err));
});

export default processGist;
