import WebpackPlugin from './plugin';

class WebpackRunner {

  constructor(webpack) {
    this.webpack = webpack;
  }

  run(config, session, callback) {
    session.pre();

    // TODO: clone config
    session.config(config);
    config.plugins = config.plugins || [];
    config.plugins.push(new WebpackPlugin(session));

    this.webpack(config, () => {
      callback(session.post());
    });
  }

}

export default WebpackRunner;
