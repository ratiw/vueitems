// see http://vuejs-templates.github.io/webpack for documentation.
var path = require('path')

module.exports = {
  build: {
    env: {
      NODE_ENV: '"production"'
    },
    index: path.resolve(__dirname, 'dist/index.html'),
    assetsRoot: path.resolve(__dirname, 'dist'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '/',
    productionSourceMap: true
  },
  bundle: {
    assetsRoot: path.resolve(__dirname, 'lib'),
    assetsPublicPath: '/'
  },
  docs: {
    index: path.resolve(__dirname, 'gh-pages/index.html'),
    assetsRoot: path.resolve(__dirname, 'gh-pages'),
    assetsSubDirectory: 'static',
    assetsPublicPath: '',
    productionSourceMap: true
  },
  dev: {
    env: {
      NODE_ENV: '"development"'
    },
    port: 8080,
    proxyTable: {},
    assetsPublicPath: '/'
  },
  test: {
    env: {
      NODE_ENV: '"testing"'
    }
  }
}
