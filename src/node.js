import EventEmitter from 'events';

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

  constructor(node) {
    this._node = node;
  }

  use(descriptor) {
    if (this._sealed) {
      throw new Error('Cannot register new dependency after setup phase.');
    }
    const dependency = new DependencyInterface(descriptor);
    this._node._dependencies.push(dependency);
    return dependency;
  }

  _seal() {
    this._sealed = true;
  }

  get sealed() {
    return !!this._sealed;
  }

}

class HooksInterface {

  constructor(node) {
    this._events = node.events;
  }

  call() {
    this._events.emit.apply(this._events, arguments);
  }

}

class Node {

  constructor(plugin) {
    this._dependencies = [];
    this.events = new EventEmitter();
    this.plugin = plugin;

    // supply plugins API to plugin
    const plugins = new PluginsInterface(this);
    if (typeof plugin.setup === 'function') {
      plugin.setup(plugins);
    }
    plugins._seal();

    // inject hooks API
    Object.defineProperty(plugin, 'hooks', {
      value: new HooksInterface(this)
    });
  }

  on(listeners) {
    const events = this.events;
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
