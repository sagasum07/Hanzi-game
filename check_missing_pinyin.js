const fs = require('fs');
const jsCode = fs.readFileSync('app.js', 'utf8');

// Use a regex to extract wordsByLevel and sentencesByLevel
// Or just evaluate the file! But wait, we can't easily eval because of DOM operations.
// Let's just create a mock DOM environment so we can require app.js, or extract just the data.
