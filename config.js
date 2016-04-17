var fs = require('fs');

// fbAppId: https://developers.facebook.com/apps/980720862017475
// fbPageId: // https://www.facebook.com/superpixeltest/

module.exports = {
  v: JSON.parse(fs.readFileSync('config.json', 'utf8'))
}