class WebpackStatsPlugin {

  constructor() {}

  compiler(compiler) {
    const self = this;
    compiler.plugin('done', (stats, callback) => {
      self.hooks.call('stats', stats);
      if (typeof callback === 'function') {
        callback(); // compatible with webpack 4
      }
    });
  }

}

export default WebpackStatsPlugin;
