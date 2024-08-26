const { override, addWebpackAlias } = require('customize-cra');
const path = require('path');

module.exports = override(
  addWebpackAlias({
    'react': 'preact/compat',
    'react-dom': 'preact/compat',
  })
);
