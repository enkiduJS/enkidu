class WebpackStatsPlugin {

  constructor() {}

  setup(plugins) {
    plugins.runner.on('compiler', this.compiler.bind(this));
  }

  compiler(compiler) {
    const hooks = this.hooks;
    compiler.plugin('done', (stats, callback) => {
      hooks.call('stats', stats);
      if (typeof callback === 'function') {
        callback(); // compatible with webpack 4
      }
    });
  }

}

export default WebpackStatsPlugin;
