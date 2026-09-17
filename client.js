const fs = require('fs');
const path = require('path');

if (fs.existsSync(path.join(__dirname, 'dist', 'client', 'index.js'))) {
  module.exports = require('./dist/client/index.js');
} else {
  module.exports = require('./src/client');
}
