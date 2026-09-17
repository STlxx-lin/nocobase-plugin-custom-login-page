const path = require('path');
const fs = require('fs');

if (!process.env.NODE_MODULES_PATH) {
  process.env.NODE_MODULES_PATH = path.resolve(process.cwd(), 'node_modules');
}

try {
  const { PluginManager } = require('@nocobase/server');
  if (PluginManager) {
    const parsedNames = PluginManager.parsedNames || (PluginManager.parsedNames = {});
    parsedNames['custom-login-page'] = {
      name: 'custom-login-page',
      packageName: '@nocobase/plugin-custom-login-page',
    };
    parsedNames['@nocobase/plugin-custom-login-page'] = {
      name: 'custom-login-page',
      packageName: '@nocobase/plugin-custom-login-page',
    };
  }
} catch (e) {}

let plugin;
if (fs.existsSync(path.join(__dirname, 'dist', 'server', 'index.js'))) {
  plugin = require('./dist/server/index.js');
} else {
  plugin = require('./src/server');
}

module.exports = plugin.default || plugin;
