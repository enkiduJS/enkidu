import Node from './node';
import hashFn from './hash';

class Cache {

  constructor() {
    this._map = new WeakMap();
  }

  _isValid(c, hash) {
    return typeof c === 'function' && typeof hash === 'string';
  }

  get(c, hash) {
    if (!this._isValid(c, hash)) {
      return undefined;
    }
    const m = this._map.get(c);
    return m && m[hash];
  }

  set(c, hash, node) {
    if (!this._isValid(c, hash)) {
      return;
    }
    let m = this._map.get(c);
    if (m === undefined) {
      this._map.set(m = {});
    }
    m[hash] = node;
  }

}

class NodePool {

  constructor() {
    this._nodeCache = new Cache();
    this._nodeList = [];
    this._pluginSet = new Set();
  }

  resolve(descriptors) {
    for (let desc of descriptors) {
      this._resolve(desc);
    }
    return Object.freeze(this._nodeList);
  }

  _resolve(descriptor) {
    // TODO: cycle detection
    let plugin, c, hash;

    // 1. determine the plugin instance
    if (typeof descriptor === 'string' || typeof descriptor === 'function') {
      descriptor = [descriptor];
    }
    if (Array.isArray(descriptor)) {
      c = descriptor[0];
      if (typeof c === 'string') {
        c = require(c);
      }

      if (typeof c === 'function') {
        const args = descriptor.slice(1);

        // look up in cache
        hash = hashFn(c, args);
        const cached = this._nodeCache.get(c, hash);
        if (cached !== undefined) {
          return cached;
        }

        // instantiate
        plugin = new (c.bind.apply(c, args))();

      } else if (typeof c === 'object') {
        plugin = c;

      } else {
        throw new Error('Plugin path must be resolved to a function or an object: ' + descriptor[0]);
      }

    } else if (typeof descriptor === 'object') {
      plugin = descriptor;

    } else {
      throw new Error('Unrecognized plugin descriptor: ' + descriptor);
    }

    // 2. dedupe plugin instance, as user may include object descriptor twice
    if (this._pluginSet.has(plugin)) {
      return;
    }
    this._pluginSet.add(plugin);

    // 3. create node and add to cache (if applicable)
    const node = new Node(plugin);
    this._nodeCache.set(c, hash, node);

    // 4. recurse: run dependencies first so they appear first in the node list
    for (let dep of node._dependencies) {
      dep._setNode(this._resolve(dep.descriptor));
    }

    // 5. add to list
    this._nodeList.push(node);

    return node;
  }

}

class Session {

  constructor(descriptors) {
    this.nodes = new NodePool().resolve(descriptors);
  }

  _call() {
    let returnValue, value;
    for (let node of this.nodes) {
      value = node.call.apply(node, arguments);
      if (value !== undefined) {
        returnValue = value;
      }
    }
    return returnValue;
  }

  pre() {
    this._call('pre');
  }

  config(config) {
    this._call('config', config);
  }

  compiler(compiler) {
    this._call('compiler', compiler);
  }

  post() {
    return this._call('post');
  }

}

export default Session;
