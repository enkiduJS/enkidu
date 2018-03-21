class WebpackModulePlugin {

  constructor() {}

  compiler(compiler) {
    const self = this;
    compiler.plugin('compilation', (compilation) => {
      compilation.plugin('succeed-module', (module) => {
        self.hooks.call('module', module);
      });
    });
  }

}

export default WebpackModulePlugin;
