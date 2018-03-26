import Emitter from './event';

class DependencyInterface {

  constructor(descriptor) {
    this._listeners = {};
    this._descriptor = descriptor;
  }

  on(name, callback) {
    if (this._node) {
      this._node.events.on(name, callback);

    } else {
      // node not resolved yet, keep track of listeners here
      (this._listeners[name] || (this._listeners[name] = [])).push(callback);
    }
  }

  get descriptor() {
    return this._descriptor;
  }

  _setNode(node) {
    if (this._node) {
      throw new Error('Illegal state: node should only be set once.');
    }
    // register all listeners on node
    (this._node = node).on(this._listeners);
    this._listeners = {};
  }

}

class PluginsInterface {

  constructor(dependencies, runnerEvents) {
    this._dependencies = dependencies;
    this._runnerEvents = runnerEvents;
  }

  use(descriptor) {
    if (this._sealed) {
      throw new Error('Cannot register new dependency after setup phase.');
    }
    const dependency = new DependencyInterface(descriptor);
    this._dependencies.push(dependency);
    return dependency;
  }

  get runner() {
    return this._runnerEvents;
  }

  _seal() {
    this._sealed = true;
  }

  get sealed() {
    return !!this._sealed;
  }

}

class Node {

  constructor(runnerEvents, plugin) {
    this._dependencies = [];
    this._emitter = new Emitter();
    this.plugin = plugin;

    // supply plugins API to plugin
    const plugins = new PluginsInterface(this._dependencies, runnerEvents);
    if (typeof plugin.setup === 'function') {
      plugin.setup(plugins);
    }
    plugins._seal();

    // inject hooks API
    Object.defineProperty(plugin, 'hooks', {
      value: this._emitter.hooks
    });
  }

  on(listeners) {
    const events = this._emitter.events;
    for (let key in listeners) {
      for (let listener of listeners[key]) {
        events.on(key, listener);
      }
    }
  }

  call(prop) {
    const plugin = this.plugin;
    const fn = plugin[prop];
    return typeof fn === 'function' ?
      fn.apply(plugin, Array.prototype.slice.call(arguments, 1)) :
      undefined;
  }

}

export default Node;
