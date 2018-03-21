class WebpackPlugin {

  constructor(session) {
    this.session = session;
  }

  apply(compiler) {
    // plugin emit rather than shouldEmit, so descendants have a chance to add something back into assets 
    compiler.plugin('emit', (compilation, callback) => {
      compilation.assets = {};
      callback();
    });
    this.session.compiler(compiler);
  }

}

export default WebpackPlugin;
