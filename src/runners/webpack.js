import pathAPI from 'path';

class WebpackPlugin {

  constructor(session) {
    this._session = session;
  }

  apply(compiler) {
    // plugin emit rather than shouldEmit, so descendants have a chance to add something back into assets 
    compiler.plugin('emit', (compilation, callback) => {
      compilation.assets = {};
      callback();
    });
    // this._session.compiler(compiler);
    this._session.hooks.call('compiler', compiler);
  }

}

function resolveWebpack(options) {
  if (options.webpack) {
    return options.webpack;
  }
  const projectDir = options.projectDir || '.';
  return require(pathAPI.join(projectDir, 'node_modules/webpack'));
}

function resolveWebpackConfig(options) {
  if (options.config) {
    return options.config;
  }
  const projectDir = options.projectDir || '.';
  return require(pathAPI.join(projectDir, 'webpack.config.js'));
}

class WebpackRunner {

  constructor(options) {
    this.options = options = options || {};
    this.webpack = resolveWebpack(options);
    this.config = resolveWebpackConfig(options);
  }

  run(session, callback) {
    session.pre();

    // TODO: clone config
    const config = this.config;
    session.hooks.call('config', config);
    // session.config(config);
    config.plugins = config.plugins || [];
    config.plugins.push(new WebpackPlugin(session));

    this.webpack(config, () => {
      callback(session.post());
    });
  }

}

export default WebpackRunner;
