class WebpackModulePlugin {

  constructor() {}

  setup(plugins) {
    plugins.runner.on('compiler', this.compiler.bind(this));
  }

  compiler(compiler) {
    const hooks = this.hooks;
    compiler.plugin('compilation', (compilation) => {
      compilation.plugin('succeed-module', (module) => {
        hooks.call('module', module);
      });
    });
  }

}

export default WebpackModulePlugin;
